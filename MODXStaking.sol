// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract MODXStaking is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;
    
    IERC20 public immutable modxToken;
    
    struct StakingPool {
        uint256 duration;          // Staking süresi (saniye)
        uint256 apy;              // Yıllık getiri oranı (basis points, 1000 = 10%)
        uint256 totalStaked;      // Toplam stake edilen miktar
        uint256 maxStakePerUser;  // Kullanıcı başına max stake
        bool isActive;            // Pool aktif mi
    }
    
    struct UserStake {
        uint256 amount;           // Stake edilen miktar
        uint256 rewardDebt;       // Ödül borcu
        uint256 stakeTime;        // Stake edilme zamanı
        uint256 lockEndTime;      // Kilit süresi bitiş zamanı
        uint256 poolId;           // Hangi pool'da stake edildi
    }
    
    mapping(uint256 => StakingPool) public stakingPools;
    mapping(address => mapping(uint256 => UserStake)) public userStakes;
    mapping(address => uint256[]) public userPoolIds;
    
    uint256 public poolCount;
    uint256 public totalStakedGlobal;
    uint256 public rewardPerSecond;
    
    event Staked(address indexed user, uint256 indexed poolId, uint256 amount);
    event Unstaked(address indexed user, uint256 indexed poolId, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event PoolCreated(uint256 indexed poolId, uint256 duration, uint256 apy);
    event PoolUpdated(uint256 indexed poolId, uint256 apy, bool isActive);
    
    constructor(address _modxToken) Ownable(msg.sender) {
        modxToken = IERC20(_modxToken);
        rewardPerSecond = 1e18; // 1 MODX per second initial reward rate
        
        // Create default pools
        _createPool(30 days, 1200, 10000 * 1e18, true);    // 30 gün, %12 APY
        _createPool(90 days, 1800, 50000 * 1e18, true);    // 90 gün, %18 APY
        _createPool(180 days, 2500, 100000 * 1e18, true);  // 180 gün, %25 APY
        _createPool(365 days, 3600, 500000 * 1e18, true);  // 365 gün, %36 APY
    }
    
    function stake(uint256 poolId, uint256 amount) external nonReentrant whenNotPaused {
        require(poolId < poolCount, "Invalid pool");
        require(amount > 0, "Amount must be > 0");
        
        StakingPool storage pool = stakingPools[poolId];
        require(pool.isActive, "Pool not active");
        
        UserStake storage userStake = userStakes[msg.sender][poolId];
        
        if (userStake.amount == 0) {
            userPoolIds[msg.sender].push(poolId);
        }
        
        require(userStake.amount + amount <= pool.maxStakePerUser, "Exceeds max stake per user");
        
        // Claim pending rewards
        if (userStake.amount > 0) {
            _claimRewards(msg.sender, poolId);
        }
        
        modxToken.safeTransferFrom(msg.sender, address(this), amount);
        
        userStake.amount += amount;
        userStake.stakeTime = block.timestamp;
        userStake.lockEndTime = block.timestamp + pool.duration;
        userStake.poolId = poolId;
        userStake.rewardDebt = (userStake.amount * getAccRewardPerShare(poolId)) / 1e12;
        
        pool.totalStaked += amount;
        totalStakedGlobal += amount;
        
        emit Staked(msg.sender, poolId, amount);
    }
    
    function unstake(uint256 poolId) external nonReentrant {
        UserStake storage userStake = userStakes[msg.sender][poolId];
        require(userStake.amount > 0, "No stake found");
        require(block.timestamp >= userStake.lockEndTime, "Stake still locked");
        
        _claimRewards(msg.sender, poolId);
        
        uint256 amount = userStake.amount;
        stakingPools[poolId].totalStaked -= amount;
        totalStakedGlobal -= amount;
        
        userStake.amount = 0;
        userStake.rewardDebt = 0;
        
        modxToken.safeTransfer(msg.sender, amount);
        
        emit Unstaked(msg.sender, poolId, amount);
    }
    
    function claimRewards(uint256 poolId) external nonReentrant {
        _claimRewards(msg.sender, poolId);
    }
    
    function _claimRewards(address user, uint256 poolId) internal {
        UserStake storage userStake = userStakes[user][poolId];
        if (userStake.amount == 0) return;
        
        uint256 pending = getPendingRewards(user, poolId);
        if (pending > 0) {
            modxToken.safeTransfer(user, pending);
            userStake.rewardDebt = (userStake.amount * getAccRewardPerShare(poolId)) / 1e12;
            emit RewardsClaimed(user, pending);
        }
    }
    
    function getPendingRewards(address user, uint256 poolId) public view returns (uint256) {
        UserStake memory userStake = userStakes[user][poolId];
        if (userStake.amount == 0) return 0;
        
        uint256 accRewardPerShare = getAccRewardPerShare(poolId);
        return (userStake.amount * accRewardPerShare) / 1e12 - userStake.rewardDebt;
    }
    
    function getAccRewardPerShare(uint256 poolId) public view returns (uint256) {
        StakingPool memory pool = stakingPools[poolId];
        if (pool.totalStaked == 0) return 0;
        
        // APY bazlı hesaplama
        uint256 yearlyReward = (pool.totalStaked * pool.apy) / 10000;
        uint256 secondlyReward = yearlyReward / 365 days;
        
        return (secondlyReward * 1e12) / pool.totalStaked;
    }
    
    function getUserStakeInfo(address user, uint256 poolId) external view returns (
        uint256 amount,
        uint256 stakeTime,
        uint256 lockEndTime,
        uint256 pendingRewards,
        bool canUnstake
    ) {
        UserStake memory userStake = userStakes[user][poolId];
        return (
            userStake.amount,
            userStake.stakeTime,
            userStake.lockEndTime,
            getPendingRewards(user, poolId),
            block.timestamp >= userStake.lockEndTime && userStake.amount > 0
        );
    }
    
    // Admin functions
    function createPool(
        uint256 duration,
        uint256 apy,
        uint256 maxStakePerUser
    ) external onlyOwner {
        _createPool(duration, apy, maxStakePerUser, true);
    }
    
    function _createPool(
        uint256 duration,
        uint256 apy,
        uint256 maxStakePerUser,
        bool isActive
    ) internal {
        stakingPools[poolCount] = StakingPool({
            duration: duration,
            apy: apy,
            totalStaked: 0,
            maxStakePerUser: maxStakePerUser,
            isActive: isActive
        });
        
        emit PoolCreated(poolCount, duration, apy);
        poolCount++;
    }
    
    function updatePool(uint256 poolId, uint256 apy, bool isActive) external onlyOwner {
        require(poolId < poolCount, "Invalid pool");
        stakingPools[poolId].apy = apy;
        stakingPools[poolId].isActive = isActive;
        emit PoolUpdated(poolId, apy, isActive);
    }
    
    function emergencyWithdraw(uint256 poolId) external nonReentrant {
        UserStake storage userStake = userStakes[msg.sender][poolId];
        require(userStake.amount > 0, "No stake found");
        
        uint256 amount = userStake.amount;
        stakingPools[poolId].totalStaked -= amount;
        totalStakedGlobal -= amount;
        
        userStake.amount = 0;
        userStake.rewardDebt = 0;
        
        // Emergency withdraw fee (%10)
        uint256 fee = (amount * 10) / 100;
        uint256 withdrawAmount = amount - fee;
        
        modxToken.safeTransfer(msg.sender, withdrawAmount);
        
        emit Unstaked(msg.sender, poolId, withdrawAmount);
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // Emergency function to withdraw stuck tokens
    function emergencyTokenWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(owner(), amount);
    }
}

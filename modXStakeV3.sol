// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract MODXStakingV3 is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;

    IERC20 public immutable modxToken;

    struct StakingPool {
        uint256 duration;         // Lock süresi (saniye)
        uint256 apy;              // APY (ör: 1200 = %12)
        uint256 totalStaked;     // Havuzdaki toplam stake miktarı
        uint256 maxStakePerUser; // Kişi başına max stake
        bool isActive;           // Havuz açık mı
    }

    struct UserStake {
        uint256 amount;
        uint256 rewardDebt;
        uint256 stakeTime;
        uint256 lockEndTime;
    }

    mapping(uint256 => StakingPool) public stakingPools;
    mapping(address => mapping(uint256 => UserStake)) public userStakes;
    mapping(address => uint256[]) public userPoolIds;
    
    mapping(uint256 => uint256) public accRewardPerShare;
    mapping(uint256 => uint256) public lastRewardTime;

    uint256 public poolCount;
    uint256 public totalStakedGlobal;

    event Staked(address indexed user, uint256 indexed poolId, uint256 amount);
    event Unstaked(address indexed user, uint256 indexed poolId, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 indexed poolId, uint256 amount);
    event PoolCreated(uint256 indexed poolId, uint256 duration, uint256 apy);
    event PoolUpdated(uint256 indexed poolId, uint256 apy, bool isActive);

    constructor(address _modxToken) Ownable(msg.sender) {
        modxToken = IERC20(_modxToken);
        _createPool(30 days, 1200, 10000 * 1e18, true);
        _createPool(90 days, 1800, 50000 * 1e18, true);
        _createPool(180 days, 2500, 100000 * 1e18, true);
        _createPool(365 days, 3600, 500000 * 1e18, true);
    }

    function stake(uint256 poolId, uint256 amount) external nonReentrant whenNotPaused {
        require(poolId < poolCount, "Invalid pool");
        require(amount > 0, "Amount must be > 0");

        StakingPool storage pool = stakingPools[poolId];
        require(pool.isActive, "Pool not active");

        UserStake storage u = userStakes[msg.sender][poolId];
        if (u.amount == 0) userPoolIds[msg.sender].push(poolId);
        require(u.amount + amount <= pool.maxStakePerUser, "Exceeds max per user");

        updatePool(poolId);
        if (u.amount > 0) _claimRewards(msg.sender, poolId);

        modxToken.safeTransferFrom(msg.sender, address(this), amount);

        u.amount += amount;
        u.stakeTime = block.timestamp;
        u.lockEndTime = block.timestamp + pool.duration;
        u.rewardDebt = (u.amount * accRewardPerShare[poolId]) / 1e12;

        pool.totalStaked += amount;
        totalStakedGlobal += amount;

        emit Staked(msg.sender, poolId, amount);
    }

    function unstake(uint256 poolId) external nonReentrant {
        UserStake storage u = userStakes[msg.sender][poolId];
        require(u.amount > 0, "No stake");
        require(block.timestamp >= u.lockEndTime, "Still locked");

        updatePool(poolId);
        _claimRewards(msg.sender, poolId);

        uint256 amount = u.amount;
        u.amount = 0;
        u.rewardDebt = 0;
        stakingPools[poolId].totalStaked -= amount;
        totalStakedGlobal -= amount;

        modxToken.safeTransfer(msg.sender, amount);

        emit Unstaked(msg.sender, poolId, amount);
    }

    function claimRewards(uint256 poolId) external nonReentrant {
        updatePool(poolId);
        _claimRewards(msg.sender, poolId);
    }

    function _claimRewards(address user, uint256 poolId) internal {
        UserStake storage u = userStakes[user][poolId];
        uint256 pending = getPendingRewards(user, poolId);
        if (pending > 0) {
            u.rewardDebt = (u.amount * accRewardPerShare[poolId]) / 1e12;
            modxToken.safeTransfer(user, pending);
            emit RewardsClaimed(user, poolId, pending);
        }
    }

    function getPendingRewards(address user, uint256 poolId) public view returns (uint256) {
        UserStake storage u = userStakes[user][poolId];
        if (u.amount == 0) return 0;

        uint256 acc = accRewardPerShare[poolId];
        StakingPool storage pool = stakingPools[poolId];

        if (block.timestamp > lastRewardTime[poolId] && pool.totalStaked > 0) {
            uint256 duration = block.timestamp - lastRewardTime[poolId];
            uint256 yearlyReward = (pool.totalStaked * pool.apy) / 10000;
            uint256 reward = (yearlyReward * duration) / 365 days;
            acc += (reward * 1e12) / pool.totalStaked;
        }

        return (u.amount * acc) / 1e12 - u.rewardDebt;
    }

    function updatePool(uint256 poolId) public {
        StakingPool storage pool = stakingPools[poolId];
        if (block.timestamp <= lastRewardTime[poolId]) return;
        if (pool.totalStaked == 0) {
            lastRewardTime[poolId] = block.timestamp;
            return;
        }

        uint256 duration = block.timestamp - lastRewardTime[poolId];
        uint256 yearlyReward = (pool.totalStaked * pool.apy) / 10000;
        uint256 reward = (yearlyReward * duration) / 365 days;

        accRewardPerShare[poolId] += (reward * 1e12) / pool.totalStaked;
        lastRewardTime[poolId] = block.timestamp;
    }

    function _createPool(uint256 duration, uint256 apy, uint256 maxStakePerUser, bool isActive) internal {
        stakingPools[poolCount] = StakingPool({
            duration: duration,
            apy: apy,
            totalStaked: 0,
            maxStakePerUser: maxStakePerUser,
            isActive: isActive
        });
        lastRewardTime[poolCount] = block.timestamp;
        emit PoolCreated(poolCount, duration, apy);
        poolCount++;
    }

    function createPool(uint256 duration, uint256 apy, uint256 maxStakePerUser) external onlyOwner {
        _createPool(duration, apy, maxStakePerUser, true);
    }

    function updatePoolParams(uint256 poolId, uint256 apy, bool isActive) external onlyOwner {
        require(poolId < poolCount, "Invalid pool");
        stakingPools[poolId].apy = apy;
        stakingPools[poolId].isActive = isActive;
        emit PoolUpdated(poolId, apy, isActive);
    }

    function getUserStakeInfo(address user, uint256 poolId) external view returns (
        uint256 amount,
        uint256 stakeTime,
        uint256 lockEndTime,
        uint256 pendingRewards,
        bool canUnstake
    ) {
        UserStake storage u = userStakes[user][poolId];
        return (
            u.amount,
            u.stakeTime,
            u.lockEndTime,
            getPendingRewards(user, poolId),
            block.timestamp >= u.lockEndTime && u.amount > 0
        );
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function emergencyWithdraw(uint256 poolId) external nonReentrant {
        UserStake storage u = userStakes[msg.sender][poolId];
        require(u.amount > 0, "No stake");

        stakingPools[poolId].totalStaked -= u.amount;
        totalStakedGlobal -= u.amount;

        uint256 fee = (u.amount * 10) / 100;
        uint256 amountAfterFee = u.amount - fee;

        u.amount = 0;
        u.rewardDebt = 0;

        modxToken.safeTransfer(msg.sender, amountAfterFee);
        emit Unstaked(msg.sender, poolId, amountAfterFee);
    }

    function emergencyTokenWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(owner(), amount);
    }
}

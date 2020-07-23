<?php


namespace HawkSearch\Proxy\Model\Task;

use HawkSearch\Proxy\Model\Task\Exception\TaskLockException;
use HawkSearch\Proxy\Model\Task\Exception\TaskUnlockException;
use InvalidArgumentException;
use Magento\Framework\Exception\AlreadyExistsException;
use Magento\Framework\Exception\InputException;
use Magento\Framework\Lock\Backend\Database as DatabaseLockManager;
use Magento\Framework\Lock\LockManagerInterface;
use Zend_Db_Statement_Exception;

abstract class AbstractTaskLock
{
    /** @var LockManagerInterface */
    private $lockManager;

    /** @var string */
    protected $lockName = '';

    /** @var int */
    protected $lockTimeout = 300;

    /**
     * @param DatabaseLockManager $databaseLockManager
     */
    public function __construct(DatabaseLockManager $databaseLockManager)
    {
        $this->lockManager = $databaseLockManager;
    }

    /**
     * Attempts to lock the lock.
     * @throws TaskLockException
     */
    public function lock() : void
    {
        $this->requireLockName();

        try {
            if (! $this->lockManager->lock($this->lockName, $this->lockTimeout)) {
                throw new TaskLockException('failed to lock');
            }
        } catch (AlreadyExistsException | InputException | Zend_Db_Statement_Exception $exception) {
            throw new TaskLockException('failed to lock');
        }
    }

    /**
     * Attempts to unlock the lock.
     * @throws TaskUnlockException
     */
    public function unlock() : void
    {
        $this->requireLockName();

        try {
            // no return check, if 'falsy' then nothing was locked
            $this->lockManager->unlock($this->lockName);
        } catch (InputException | Zend_Db_Statement_Exception $exception) {
            throw new TaskUnlockException('failed to unlock');
        }
    }

    /**
     * Checks the lock status.
     * @return bool true if locked, else returns false
     * @throws TaskLockException
     */
    public function isLocked() : bool
    {
        $this->requireLockName();

        try {
            return $this->lockManager->isLocked($this->lockName);
        } catch (InputException | Zend_Db_Statement_Exception $exception) {
            throw new TaskLockException('failed to verify lock status');
        }
    }

    /**
     * Throws an exception if the lock name is not overridden by subclass.
     */
    private function requireLockName() : void
    {
        if ($this->lockName === '') {
            throw new InvalidArgumentException('no lock name provided');
        }
    }
}

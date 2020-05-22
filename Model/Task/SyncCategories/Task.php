<?php


namespace HawkSearch\Proxy\Model\Task\SyncCategories;


use Exception;
use HawkSearch\Proxy\Helper\Data;
use HawkSearch\Proxy\Model\Task\Exception\TaskException;
use HawkSearch\Proxy\Model\Task\Exception\TaskLockException;
use HawkSearch\Proxy\Model\Task\Exception\TaskUnlockException;

class Task
{
    /** @var Data */
    private $helper;

    /** @var TaskLock */
    private $taskLock;

    /** @var TaskResultsFactory */
    private $taskResultsFactory;

    /**
     * @param Data $helper
     * @param TaskLock $taskLock
     * @param TaskResultsFactory $taskResultsFactory
     */
    public function __construct(
        Data $helper,
        TaskLock $taskLock,
        TaskResultsFactory $taskResultsFactory
    )
    {
        $this->helper             = $helper;
        $this->taskLock           = $taskLock;
        $this->taskResultsFactory = $taskResultsFactory;
    }

    /**
     * Task entry point.
     * @param TaskOptions $options
     * @return TaskResults
     * @throws TaskLockException
     * @throws TaskUnlockException
     * @throws TaskException
     */
    public function execute( TaskOptions $options ) : TaskResults
    {
        $this->lock( $options );
        $results = $this->syncCategories();
        $this->unlock( $options );

        return $results;
    }

    /**
     * @return TaskResults
     * @throws TaskException
     */
    private function syncCategories() : TaskResults
    {
        try {
            $errors = $this->helper->synchronizeHawkLandingPages();

            $results = $this->taskResultsFactory->create();
            $results->setErrors( $errors );
            return $results;

        }
        catch ( Exception $exception ) {
            throw new TaskException( 'An error occurred during Hawksearch Category Sync' . $exception->getMessage() );
        }
    }

    /**
     * @param TaskOptions $options
     * @throws TaskLockException
     */
    private function lock( TaskOptions $options ) : void
    {
        if ( $options->isForceMode() ) {
            return;
        }

        $this->taskLock->lock();
    }

    /**
     * @param TaskOptions $options
     * @throws TaskUnlockException
     */
    private function unlock( TaskOptions $options ) : void
    {
        if ( $options->isForceMode() ) {
            return;
        }

        $this->taskLock->unlock();
    }
}

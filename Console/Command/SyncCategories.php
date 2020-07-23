<?php


namespace HawkSearch\Proxy\Console\Command;

use HawkSearch\Proxy\Model\Task\Exception\TaskException;
use HawkSearch\Proxy\Model\Task\Exception\TaskLockException;
use HawkSearch\Proxy\Model\Task\Exception\TaskUnlockException;
use HawkSearch\Proxy\Model\Task\SyncCategories\Task;
use HawkSearch\Proxy\Model\Task\SyncCategories\TaskOptions;
use HawkSearch\Proxy\Model\Task\SyncCategories\TaskOptionsFactory;
use HawkSearch\Proxy\Model\Task\SyncCategories\TaskResults;
use Magento\Framework\App\Area;
use Magento\Framework\App\State;
use Magento\Framework\Exception\LocalizedException;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class SyncCategories extends Command
{
    /** @var State */
    private $state;

    /** @var Task */
    private $task;

    /** @var TaskOptionsFactory */
    private $taskOptionsFactory;

    /**
     * @param State $state
     * @param Task $task
     * @param TaskOptionsFactory $taskOptionsFactory
     * @param string|null $name
     */
    public function __construct(
        State $state,
        Task $task,
        TaskOptionsFactory $taskOptionsFactory,
        string $name = null
    ) {
        parent::__construct($name);

        $this->state              = $state;
        $this->task               = $task;
        $this->taskOptionsFactory = $taskOptionsFactory;
    }

    /**
     * @inheritDoc
     */
    protected function configure() : void
    {
        $this->setName('hawksearch:proxy:sync-categories')
            ->setDescription('Run the HawkSearch Category Sync Task');
        parent::configure();
    }

    /**
     * @param InputInterface $input
     * @param OutputInterface $output
     * @return void
     * @throws LocalizedException
     */
    protected function execute(InputInterface $input, OutputInterface $output) : void
    {
        $this->state->setAreaCode(Area::AREA_CRONTAB);

        /** @var TaskOptions $options */
        $options = $this->taskOptionsFactory->create();

        try {
            $results = $this->task->execute($options);
            $this->reportSuccess($results, $output);
        } catch (TaskLockException $exception) {
            $output->writeln('Failed to lock, please check the status of the database lock');
        } catch (TaskUnlockException $exception) {
            $output->writeln('Failed to unlock, please verify that the database lock was cleared');
        } catch (TaskException $exception) {
            $output->writeln('An error occurred: ' . $exception->getMessage());
        }
    }

    /**
     * Outputs result data.
     * @param TaskResults $results
     * @param OutputInterface $output
     */
    private function reportSuccess(TaskResults $results, OutputInterface $output) : void
    {
        $output->writeln('Successfully synchronized categories');
    }
}

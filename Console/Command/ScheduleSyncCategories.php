<?php


namespace HawkSearch\Proxy\Console\Command;


use HawkSearch\Proxy\Model\Task\Exception\AlreadyScheduledException;
use HawkSearch\Proxy\Model\Task\Exception\SchedulerException;
use HawkSearch\Proxy\Model\Task\SyncCategories\TaskScheduler;
use Magento\Cron\Model\Schedule;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class ScheduleSyncCategories extends Command
{
    /** @var TaskScheduler */
    private $taskScheduler;

    /**
     * @param TaskScheduler $taskScheduler
     * @param string|null $name
     */
    public function __construct(
        TaskScheduler $taskScheduler,
        string $name = null
    )
    {
        parent::__construct( $name );
        $this->taskScheduler = $taskScheduler;
    }

    /** @inheritDoc */
    protected function configure() : void
    {
        parent::configure();

        $this->setName( 'hawksearch:proxy:schedule-sync-categories' )
            ->setDescription( 'Schedule the HawkSearch Category Sync Task in the cron schedule' );
    }

    /**
     * @param InputInterface $input
     * @param OutputInterface $output
     * @return void
     */
    protected function execute( InputInterface $input, OutputInterface $output ) : void
    {
        try {
            $schedule = $this->taskScheduler->schedule();
            $this->reportSuccess( $schedule, $output );
        }
        catch ( AlreadyScheduledException $exception ) {
            $output->writeln( 'Failed to schedule datafeed generation: a pending job already exists' );
        }
        catch ( SchedulerException $exception ) {
            $output->writeln( 'An error occurred: ' . $exception->getMessage() );
        }
    }

    /**
     * Reports schedule data.
     * @param Schedule $schedule
     * @param OutputInterface $output
     */
    private function reportSuccess( Schedule $schedule, OutputInterface $output ) : void
    {
        $output->writeln( 'Successfully scheduled Sync Categories task' );
        $output->writeln( 'ID: ' . $schedule->getId() );
        $output->writeln( 'Created At: ' . $schedule->getCreatedAt() . ' UTC' );
        $output->writeln( 'Scheduled At: ' . $schedule->getScheduledAt() . ' UTC' );
    }
}

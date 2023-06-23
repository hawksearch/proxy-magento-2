<?php
/**
 * Copyright (c) 2023 Hawksearch (www.hawksearch.com) - All Rights Reserved
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

namespace HawkSearch\Proxy\Console\Command;

use HawkSearch\Proxy\Model\Task\Exception\AlreadyScheduledException;
use HawkSearch\Proxy\Model\Task\Exception\SchedulerException;
use HawkSearch\Proxy\Model\Task\SyncCategories\TaskScheduler;
use Magento\Cron\Model\Schedule;
use Magento\Framework\Console\Cli;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class ScheduleSyncCategories extends Command
{
    /**
     * @var TaskScheduler
     */
    private $taskScheduler;

    /**
     * @param TaskScheduler $taskScheduler
     * @param string|null $name
     */
    public function __construct(
        TaskScheduler $taskScheduler,
        string $name = null
    ) {
        parent::__construct($name);
        $this->taskScheduler = $taskScheduler;
    }

    /**
     * @inheritDoc
     */
    protected function configure() : void
    {
        parent::configure();

        $this->setName('hawksearch:proxy:schedule-sync-categories')
            ->setDescription('Schedule the HawkSearch Category Sync Task in the cron schedule');
    }

    /**
     * @inheritDoc
     */
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        try {
            $schedule = $this->taskScheduler->schedule();
            $this->reportSuccess($schedule, $output);
            return Cli::RETURN_SUCCESS;
        } catch (AlreadyScheduledException $exception) {
            $output->writeln('Failed to schedule datafeed generation: a pending job already exists');
        } catch (SchedulerException $exception) {
            $output->writeln('An error occurred: ' . $exception->getMessage());
        }
        return Cli::RETURN_FAILURE;
    }

    /**
     * Reports schedule data.
     * @param Schedule $schedule
     * @param OutputInterface $output
     */
    private function reportSuccess(Schedule $schedule, OutputInterface $output) : void
    {
        $output->writeln('Successfully scheduled Sync Categories task');
        $output->writeln('ID: ' . $schedule->getId());
        $output->writeln('Created At: ' . $schedule->getCreatedAt() . ' UTC');
        $output->writeln('Scheduled At: ' . $schedule->getScheduledAt() . ' UTC');
    }
}

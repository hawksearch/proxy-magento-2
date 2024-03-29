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

use HawkSearch\Proxy\Model\Task\Exception\TaskException;
use HawkSearch\Proxy\Model\Task\Exception\TaskLockException;
use HawkSearch\Proxy\Model\Task\Exception\TaskUnlockException;
use HawkSearch\Proxy\Model\Task\SyncCategories\Task;
use HawkSearch\Proxy\Model\Task\SyncCategories\TaskOptions;
use HawkSearch\Proxy\Model\Task\SyncCategories\TaskOptionsFactory;
use HawkSearch\Proxy\Model\Task\SyncCategories\TaskResults;
use Magento\Framework\App\Area;
use Magento\Framework\App\State;
use Magento\Framework\Console\Cli;
use Magento\Framework\Exception\LocalizedException;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class SyncCategories extends Command
{
    /**
     * @var State
     */
    private $state;

    /**
     * @var Task
     */
    private $task;

    /**
     * @var TaskOptionsFactory
     */
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

        $this->state = $state;
        $this->task = $task;
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
     * @inheritDoc
     */
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $this->state->setAreaCode(Area::AREA_CRONTAB);

        /** @var TaskOptions $options */
        $options = $this->taskOptionsFactory->create();

        try {
            $results = $this->task->execute($options);
            $this->reportSuccess($results, $output);
            return Cli::RETURN_SUCCESS;
        } catch (TaskLockException $exception) {
            $output->writeln('Failed to lock, please check the status of the database lock');
        } catch (TaskUnlockException $exception) {
            $output->writeln('Failed to unlock, please verify that the database lock was cleared');
        } catch (TaskException $exception) {
            $output->writeln('An error occurred: ' . $exception->getMessage());
        }

        return Cli::RETURN_FAILURE;
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

<?php
/**
 * Copyright (c) 2020 Hawksearch (www.hawksearch.com) - All Rights Reserved
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

namespace HawkSearch\Proxy\Cron;

use HawkSearch\Proxy\Model\Config\Sync as SyncConfigProvider;
use HawkSearch\Proxy\Model\ProxyEmail;
use HawkSearch\Proxy\Model\Task\Exception\TaskException;
use HawkSearch\Proxy\Model\Task\Exception\TaskLockException;
use HawkSearch\Proxy\Model\Task\Exception\TaskUnlockException;
use HawkSearch\Proxy\Model\Task\SyncCategories\Task;
use HawkSearch\Proxy\Model\Task\SyncCategories\TaskOptionsFactory;

class SyncCategories
{
    /** @var ProxyEmail $email */
    private $email;

    /** @var Task */
    private $task;

    /** @var TaskOptionsFactory */
    private $taskOptionsFactory;

    /**
     * @var SyncConfigProvider
     */
    private $syncConfigProvider;

    /**
     * @param ProxyEmail $email
     * @param Task $task
     * @param TaskOptionsFactory $taskOptionsFactory
     * @param SyncConfigProvider $syncConfigProvider
     */
    public function __construct(
        ProxyEmail $email,
        Task $task,
        TaskOptionsFactory $taskOptionsFactory,
        SyncConfigProvider $syncConfigProvider
    )
    {
        $this->email = $email;
        $this->task = $task;
        $this->taskOptionsFactory = $taskOptionsFactory;
        $this->syncConfigProvider = $syncConfigProvider;
    }

    /**
     * Cron entry point.
     */
    public function execute()
    {
        if (!$this->syncConfigProvider->isEnabled()) {
            return;
        }

        $options = $this->taskOptionsFactory->create();

        try {
            $results = $this->task->execute($options);
            $errors = $results->getErrors();

            $subject = sprintf('HawkSearch Category Sync Completed %s errors', empty($errors) ? 'without' : 'WITH');
            $this->sendEmail($subject, $errors);
        } catch (TaskException $exception) {
            $this->sendEmail('HawkSearch Category Sync Failed');
        } catch (TaskLockException $exception) {
            $this->sendEmail('HawkSearch Proxy process is locked, Categories NOT synchronized');
        } catch (TaskUnlockException $exception) {
            $this->sendEmail('HawkSearch Proxy process failed to release lock, please verify status Category Sync');
        }
    }

    /**
     * Utility function to send emails.
     * @param string $subject
     * @param array $errors
     */
    private function sendEmail(string $subject, array $errors = [])
    {
        $errors = implode("\n", $errors);

        $this->email->sendEmail([
            'errors' => $errors,
            'subject' => $subject
        ]);
    }
}

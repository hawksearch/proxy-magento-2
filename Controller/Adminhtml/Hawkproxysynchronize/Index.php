<?php
/**
 * Copyright (c) 2018 Hawksearch (www.hawksearch.com) - All Rights Reserved
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */
namespace HawkSearch\Proxy\Controller\Adminhtml\Hawkproxysynchronize;

use DateTime;
use Exception;
use HawkSearch\Proxy\Model\Task\Exception\AlreadyScheduledException;
use HawkSearch\Proxy\Model\Task\Exception\SchedulerException;
use HawkSearch\Proxy\Model\Task\SyncCategories\TaskScheduler;
use Magento\Backend\App\Action;
use Magento\Backend\App\Action\Context;
use Magento\Cron\Model\Schedule;
use Magento\Framework\Controller\Result\Redirect;
use Magento\Framework\Stdlib\DateTime\TimezoneInterface;

class Index extends Action
{
    private const SUCCESS_MESSAGE = 'Successfully scheduled Category Sync Task';

    /** @var TaskScheduler */
    private $taskScheduler;

    /** @var TimezoneInterface */
    private $timezone;

    /**
     * @param Context $context
     * @param TaskScheduler $taskScheduler
     * @param TimezoneInterface $timezone
     */
    public function __construct(
        Context $context,
        TaskScheduler $taskScheduler,
        TimezoneInterface $timezone
    ) {
        parent::__construct($context);
        $this->taskScheduler = $taskScheduler;
        $this->timezone      = $timezone;
    }

    /**
     * @return Redirect
     */
    public function execute()
    {
        try {
            $schedule = $this->taskScheduler->schedule();
        } catch (AlreadyScheduledException $exception) {
            $this->messageManager->addWarningMessage(__('Category Sync is already scheduled'));
        } catch (SchedulerException $exception) {
            $this->messageManager->addErrorMessage(__('Failed to schedule Category Sync'));
        }

        // return to previous page
        return $this->resultRedirectFactory->create()->setUrl($this->_redirect->getRefererUrl());
    }

    /**
     * @param Schedule $schedule
     */
    private function reportSuccess(Schedule $schedule) : void
    {
        $id = $schedule->getId();

        try {
            $scheduledAt = $this->timezone
                ->date(new DateTime($schedule->getScheduledAt()))
                ->format(DateTime::RFC850);
            $this->messageManager->addSuccessMessage(
                self::SUCCESS_MESSAGE . ": $scheduledAt (ID: $id)"
            );
        } catch (Exception $exception) {
            $this->messageManager->addSuccessMessage(self::SUCCESS_MESSAGE);
        }
    }
}

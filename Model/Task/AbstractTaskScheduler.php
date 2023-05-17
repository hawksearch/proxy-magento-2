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

namespace HawkSearch\Proxy\Model\Task;

use Exception;
use HawkSearch\Proxy\Model\Task\Exception\AlreadyScheduledException;
use HawkSearch\Proxy\Model\Task\Exception\SchedulerException;
use InvalidArgumentException;
use Magento\Cron\Model\ResourceModel\Schedule as ScheduleResourceModel;
use Magento\Cron\Model\ResourceModel\Schedule\Collection as ScheduleCollection;
use Magento\Cron\Model\ResourceModel\Schedule\CollectionFactory as ScheduleCollectionFactory;
use Magento\Cron\Model\Schedule;
use Magento\Cron\Model\ScheduleFactory;
use Magento\Framework\Stdlib\DateTime\DateTime;

abstract class AbstractTaskScheduler
{
    /**
     * job_code field in cron_schedules table
     * @var string
     */
    protected $jobCode = '';

    /**
     * @var DateTime
     */
    private $dateTime;

    /**
     * @var ScheduleCollectionFactory
     */
    private $scheduleCollectionFactory;

    /**
     * @var ScheduleFactory
     */
    private $scheduleFactory;

    /**
     * @var ScheduleResourceModel
     */
    private $scheduleResourceModel;

    /**
     * @param DateTime $dateTime
     * @param ScheduleCollectionFactory $scheduleCollectionFactory
     * @param ScheduleFactory $scheduleFactory
     * @param ScheduleResourceModel $scheduleResourceModel
     */
    public function __construct(
        DateTime $dateTime,
        ScheduleCollectionFactory $scheduleCollectionFactory,
        ScheduleFactory $scheduleFactory,
        ScheduleResourceModel $scheduleResourceModel
    ) {
        $this->dateTime                  = $dateTime;
        $this->scheduleCollectionFactory = $scheduleCollectionFactory;
        $this->scheduleFactory           = $scheduleFactory;
        $this->scheduleResourceModel     = $scheduleResourceModel;
    }

    /**
     * @return Schedule|null
     */
    public function getNextScheduled() : ?Schedule
    {
        $this->requireJobCode();

        /** @var ScheduleCollection $collection */
        $collection = $this->scheduleCollectionFactory->create();
        $collection->addFieldToFilter('job_code', [ 'eq' => $this->jobCode ]);
        $collection->addFieldToFilter('status', [ 'eq' => Schedule::STATUS_PENDING ]);
        $collection->addOrder('scheduled_at', 'asc');

        /** @var Schedule $schedule */
        $schedule = $collection->getFirstItem();

        return $schedule->getId()
            ? $schedule
            : null;
    }

    /**
     * Verifies that a jobCode has been specified.
     */
    private function requireJobCode() : void
    {
        if ($this->jobCode === '') {
            throw new InvalidArgumentException('jobCode is a required field');
        }
    }

    /**
     * Attempts to schedule a new cron job entry in the cron_schedule table.
     * @throws AlreadyScheduledException
     * @throws SchedulerException
     */
    public function schedule() : Schedule
    {
        $this->requireJobCode();

        if ($this->isScheduledForNextRun()) {
            throw new AlreadyScheduledException(sprintf('job_code %s is already scheduled', $this->jobCode));
        }

        $schedule = $this->createScheduleEntry();

        try {
            $this->scheduleResourceModel->save($schedule);
            return $schedule;
        } catch (Exception $exception) {
            throw new SchedulerException(sprintf('failed to save schedule for job_code %s', $this->jobCode));
        }
    }

    /**
     * Returns true if there is a pending schedule entry in the cron_schedule table scheduled within minute from now.
     * @return bool
     */
    public function isScheduledForNextRun() : bool
    {
        $this->requireJobCode();

        $nextMinute = $this->dateTime->gmtTimestamp() + 60;

        /** @var ScheduleCollection $collection */
        $collection = $this->scheduleCollectionFactory->create();
        $collection->addFieldToFilter('job_code', [ 'eq' => $this->jobCode ]);
        $collection->addFieldToFilter('status', [ 'eq' => Schedule::STATUS_PENDING ]);
        $collection->addFieldToFilter('scheduled_at', [ 'lt' => $this->dateTime->gmtDate(null, $nextMinute) ]);
        $collection->addOrder('scheduled_at', 'asc');

        return boolval($collection->getSize());
    }

    /**
     * Creates a new cron_schedule entity.
     * @return Schedule
     */
    private function createScheduleEntry() : Schedule
    {
        $createdAt   = $this->dateTime->gmtTimestamp();
        $scheduledAt = $createdAt + 60; // add 1 minute

        /** @var Schedule $schedule */
        $schedule = $this->scheduleFactory->create()
            ->setJobCode($this->jobCode)
            ->setStatus(Schedule::STATUS_PENDING)
            ->setCreatedAt(strftime('%Y-%m-%d %H:%M:%S', $createdAt))
            ->setScheduledAt(strftime('%Y-%m-%d %H:%M', $scheduledAt));

        return $schedule;
    }
}

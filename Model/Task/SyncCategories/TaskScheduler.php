<?php


namespace HawkSearch\Proxy\Model\Task\SyncCategories;

use HawkSearch\Proxy\Model\Task\AbstractTaskScheduler;

class TaskScheduler extends AbstractTaskScheduler
{
    protected $jobCode = 'hawksearch_category_sync';
}

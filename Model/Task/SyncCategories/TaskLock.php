<?php


namespace HawkSearch\Proxy\Model\Task\SyncCategories;


use HawkSearch\Proxy\Model\Task\AbstractTaskLock;

class TaskLock extends AbstractTaskLock
{
    protected $lockName = 'hawksearch_proxy';
}

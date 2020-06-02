<?php


namespace HawkSearch\Proxy\Model\Task\SyncCategories;

class TaskOptions
{
    /** @var bool */
    protected $forceMode = false;

    /**
     * @return bool
     */
    public function isForceMode() : bool
    {
        return $this->forceMode;
    }

    /**
     * @param bool $forceMode
     */
    public function setForceMode(bool $forceMode) : void
    {
        $this->forceMode = $forceMode;
    }
}

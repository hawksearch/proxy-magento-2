<?php


namespace HawkSearch\Proxy\Model\Task\SyncCategories;


class TaskResults
{
    /** @var array */
    private $errors = [];

    /**
     * @return array
     */
    public function getErrors() : array
    {
        return $this->errors;
    }

    /**
     * @param array $errors
     */
    public function setErrors( array $errors ) : void
    {
        $this->errors = $errors;
    }
}

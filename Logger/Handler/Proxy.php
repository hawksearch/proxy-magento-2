<?php
namespace HawkSearch\Proxy\Logger\Handler;

use Monolog\Logger;

/**
 * Created by PhpStorm.
 * User: mageuser
 * Date: 3/7/17
 * Time: 2:40 PM
 */
class Proxy extends \Magento\Framework\Logger\Handler\Base
{
    protected $fileName = '/var/log/hawkproxy.log';
    protected $loggerType = Logger::DEBUG;
}
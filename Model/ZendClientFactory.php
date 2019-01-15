<?php
/**
 * Created by PhpStorm.
 * User: dev
 * Date: 1/4/19
 * Time: 10:19 AM
 */

namespace HawkSearch\Proxy\Model;


class ZendClientFactory
{
    /**
     * @return \Zend\Http\Client
     */
    public function create()
    {
        return new \Zend\Http\Client();
    }
}
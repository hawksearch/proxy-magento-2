<?php
/**
 * Created by PhpStorm.
 * User: mageuser
 * Date: 10/4/16
 * Time: 10:51 AM
 */

namespace HawkSearch\Proxy\SearchAdapter;


use Magento\Framework\Search\RequestInterface;
use Magento\Framework\Search\Response\QueryResponse;

class Adapter
implements \Magento\Framework\Search\AdapterInterface
{
    public function __construct()
    {
    }

    /**
     * Process Search Request
     *
     * @param RequestInterface $request
     * @return QueryResponse
     */
    public function query(RequestInterface $request)
    {
        // TODO: Implement query() method.
    }
}
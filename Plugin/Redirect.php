<?php
/**
 * Created by PhpStorm.
 * User: mageuser
 * Date: 4/26/18
 * Time: 1:55 PM
 */

namespace HawkSearch\Proxy\Plugin;

use Magento\Framework\App;
use Magento\Framework\App\Request\Http;
use Magento\Framework\UrlInterface;
use Magento\Framework\App\Response\RedirectInterface;
use Magento\Store\Model\StoreManagerInterface;

class Redirect extends \Magento\Framework\Controller\Result\Redirect
{
    /**
     * @var Http
     */
    private $request;
    /**
     * @var StoreManagerInterface
     */
    private $storeManager;

    public function __construct(Http $request,
                                StoreManagerInterface $storeManager,
                                RedirectInterface $redirect,
                                UrlInterface $urlBuilder)
    {
        parent::__construct($redirect, $urlBuilder);
        $this->request = $request;
        $this->storeManager = $storeManager;
    }

    public function afterSetRefererOrBaseUrl(\Magento\Framework\Controller\Result\Redirect $subject, \Magento\Framework\Controller\Result\Redirect $result) {

        $baseurl = $this->storeManager->getStore()->getBaseUrl();
        if(substr($result->url, strlen($baseurl), 9) == 'hawkproxy'){
            $result->setUrl($this->request->getServer('HTTP_REFERER'));
        }
        return $result;
    }
}
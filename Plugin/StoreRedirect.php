<?php
/**
 * Created by PhpStorm.
 * User: mageuser
 * Date: 4/26/18
 * Time: 1:55 PM
 */

namespace HawkSearch\Proxy\Plugin;

class StoreRedirect extends \Magento\Store\App\Response\Redirect
{
    public function afterGetRefererUrl($subject, $result) {
        $baseurl = $this->_storeManager->getStore()->getBaseUrl();
        if(substr($result, strlen($baseurl), 9) == 'hawkproxy'){
            return $this->_request->getServer('HTTP_REFERER');
        }
        return $result;
    }

//    public function __construct(Http $request,
//                                StoreManagerInterface $storeManager,
//                                RedirectInterface $redirect,
//                                UrlInterface $urlBuilder)
//    {
//        parent::__construct($redirect, $urlBuilder);
//        $this->request = $request;
//        $this->storeManager = $storeManager;
//    }

//    public function afterSetRefererOrBaseUrl(\Magento\Framework\Controller\Result\Redirect $subject, \Magento\Framework\Controller\Result\Redirect $result) {
//
//        $baseurl = $this->storeManager->getStore()->getBaseUrl();
//        if(substr($result->url, strlen($baseurl), 9) == 'hawkproxy'){
//            $result->setUrl($this->request->getServer('HTTP_REFERER'));
//        }
//        return $result;
//    }
}
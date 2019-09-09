<?php
/**
 * Created by PhpStorm.
 * User: mageuser
 * Date: 10/4/16
 * Time: 3:44 PM
 */

namespace HawkSearch\Proxy\Model\ResourceModel;


class Collection
extends \Magento\CatalogSearch\Model\ResourceModel\Fulltext\Collection
{
    protected function _renderFiltersBefore()
    {
        if($this->_scopeConfig->getValue('hawksearch_proxy/proxy/manage_categories', 'stores')) {
            if(!$this->_scopeConfig->getValue('hawksearch_proxy/proxy/allow_fulltext', 'stores')) {
                return;
            }
        }
        return parent::_renderFiltersBefore();
    }

}
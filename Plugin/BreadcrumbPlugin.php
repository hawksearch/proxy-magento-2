<?php
/**
 * Created by PhpStorm.
 * User: mageuser
 * Date: 4/26/18
 * Time: 1:55 PM
 */

namespace HawkSearch\Proxy\Plugin;

class BreadcrumbPlugin
{
    public function aroundGetBreadcrumbPath(\Magento\Catalog\Helper\Data $subject, callable $proceed) {
        $category = $subject->getCategory();
        if($category && $category->getHawksearchLandingPage()){
            return $category->getHawkBreadcrumbPath();
        }
        return $proceed();
    }
}
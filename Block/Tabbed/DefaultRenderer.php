<?php
/**
 * Created by PhpStorm.
 * User: dev
 * Date: 12/11/18
 * Time: 11:01 AM
 */

namespace HawkSearch\Proxy\Block\Tabbed;

class DefaultRenderer extends \HawkSearch\Proxy\Block\Tabbed
{
    public function getCustomUrl($path)
    {
        if (substr($path, 0, 4) === "http") {
            return $path;
        }
        return  sprintf("%s%s", $this->getBaseUrl(), $path);
    }
}

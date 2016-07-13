<?php
/**
 * Copyright (c) 2013 Hawksearch (www.hawksearch.com) - All Rights Reserved
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */
namespace HawkSearch\Proxy\Block\Product;
class ListProduct
    extends \Magento\Catalog\Block\Product\ListProduct
{

    private $topseen = false;


    public $helper;
    private $pagers = true;
    protected $_productCollection;


    public function setPagers($bool) {
        $this->pagers = $bool;
    }


    function _construct() {
        /** @var HawkSearch\Proxy\Helper\Data $this ->helper */

        $om = \Magento\Framework\App\ObjectManager::getInstance();
        $this->helper = $om->get('HawkSearch\Proxy\Helper\Data');
        $this->helper->setUri($this->getRequest()->getParams());
        $this->helper->setClientIp($this->getRequest()->getClientIp());
        $this->helper->setClientUa($om->create('Magento\Framework\HTTP\Header')->getHttpUserAgent());
        $this->helper->setIsHawkManaged(true);
        return parent::_construct();
    }


    public function getHawkTrackingId() {


        if (!empty($this->helper)) {
            return $this->helper->getResultData()->TrackingId;
        }
        return '';
    }

    public function getToolbarHtml() {


        if ($this->helper->getLocation() != "") {
            $helper->log(sprintf('Redirecting to location: %s', $this->helper->getLocation()));
            return $this->_redirectUrl($this->helper->getLocation());
        }


        if (!$this->helper->getIsHawkManaged()) {
            $this->helper->log('page not managed, returning core pager');
            return parent::getToolbarHtml();
        }
        if ($this->pagers) {

            if ($this->topseen) {
                return '<div id="hawkbottompager">' . $this->helper->getResultData()->Data->BottomPager . '</div>';
            }
            $this->topseen = true;
            return '<div id="hawktoppager">' . $this->helper->getResultData()->Data->TopPager . '</div>';
        } else {
            return '';
        }
    }


    public function hawkBannerObject() {
        /** @var HawkSearch\Proxy\Model\Banner $hawkBanner */
        $om = \Magento\Framework\App\ObjectManager::getInstance();
        $hawkBanner = $om->get('HawkSearch\Proxy\Model\Banner');
        return $hawkBanner;
    }


    public function getLoadedProductCollection() {


        if ($this->helper->getConfigurationData('hawksearch_proxy/general/enabled')
            && $this->helper->getConfigurationData('hawksearch_proxy/proxy/manage_search')
        ) {

            if ($this->helper->getLocation() != "") {
                $this->helper->log(sprintf('Redirecting to location: %s', $this->helper->getLocation()));
                return $this->helper->_redirectUrl($helper->getLocation());
            }

            return $this->helper->getProductCollection();
        } else {
            $this->helper->log('hawk not managing search');
            parent::getProductCollection();
        }
    }


} 
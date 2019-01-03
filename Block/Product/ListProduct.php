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

use Magento\Catalog\Api\CategoryRepositoryInterface;

class ListProduct
    extends \Magento\Catalog\Block\Product\ListProduct
{

    private $topseen = false;
    public $helper;
    protected $hawkHelper;
    private $pagers = true;
    protected $_productCollection;
    private $controller;


    public function setPagers($bool)
    {
        $this->pagers = $bool;
    }

    public function __construct(\Magento\Catalog\Block\Product\Context $context,
                                \Magento\Framework\Data\Helper\PostHelper $postDataHelper,
                                \Magento\Catalog\Model\Layer\Resolver $layerResolver,
                                CategoryRepositoryInterface $categoryRepository,
                                \Magento\Framework\Url\Helper\Data $urlHelper,
                                \HawkSearch\Proxy\Helper\Data $hawkHelper,
                                array $data = [])
    {
        $this->hawkHelper = $hawkHelper;

        /** @var \Magento\Framework\App\Request\Http $req */
        $req = $context->getRequest();
        $this->controller = $req->getControllerName();

        parent::__construct($context, $postDataHelper, $layerResolver, $categoryRepository, $urlHelper, $data);
    }

    public function getHawkTrackingId()
    {
        if (!empty($this->helper)) {
            return $this->helper->getResultData()->TrackingId;
        }
        return '';
    }

    public function getToolbarHtml()
    {
        if ($this->hawkHelper->getLocation() != "") {
            $this->hawkHelper->log(sprintf('Redirecting to location: %s', $this->hawkHelper->getLocation()));
            return $this->_redirectUrl($this->hawkHelper->getLocation());
        }

        if (!$this->hawkHelper->getIsHawkManaged()) {
            $this->hawkHelper->log('page not managed, returning core pager');
            return parent::getToolbarHtml();
        }

        if ($this->pagers) {
            if ($this->topseen) {
                return '<div id="hawkbottompager">' . $this->hawkHelper->getResultData()->Data->BottomPager . '</div>';
            }
            $this->topseen = true;
            return '<div id="hawktoppager">' . $this->hawkHelper->getResultData()->Data->TopPager . '</div>';
        } else {
            return '';
        }
    }


    protected function _getProductCollection()
    {
        if($this->controller == 'category') {
            $contextActive = $this->hawkHelper->getConfigurationData('hawksearch_proxy/proxy/manage_categories');
        } else {
            $contextActive = $this->hawkHelper->getConfigurationData('hawksearch_proxy/proxy/manage_search');
        }
        if ($this->_productCollection === null) {

            if ($this->hawkHelper->getConfigurationData('hawksearch_proxy/general/enabled') && $contextActive) {

                if ($this->hawkHelper->getLocation() != "") {
                    $this->hawkHelper->log(sprintf('Redirecting to location: %s', $this->helper->getLocation()));
                    return $this->helper->_redirectUrl($this->hawkHelper->getLocation());
                }
                $this->_productCollection = $this->hawkHelper->getProductCollection();
            } else {
                $this->hawkHelper->log('hawk not managing search');
                return parent::_getProductCollection();
            }
        }
        if($this->_productCollection == null) {
            $this->_productCollection = parent::_getProductCollection();
        }
        return $this->_productCollection;
    }

    public function getTemplateFile($template = null) {
        $this->setData('module_name', 'Magento_Catalog');
        $ret = parent::getTemplateFile($template);
        $this->setData('module_name', 'HawkSearch_Proxy');
        return $ret;
    }
} 
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
namespace HawkSearch\Proxy\Block;
use Magento\Catalog\Model\Layer\Resolver as LayerResolver;
use Magento\CatalogSearch\Helper\Data;
use Magento\Framework\View\Element\Template\Context;
use Magento\Search\Model\QueryFactory;

/**
 * Product search result block
 */
class Result
    extends \Magento\CatalogSearch\Block\Result
{
    /**
     * @var \HawkSearch\Proxy\Helper\Data
     */
    private $helper;

    /**
     * Result constructor.
     * @param Context $context
     * @param LayerResolver $layerResolver
     * @param Data $catalogSearchData
     * @param QueryFactory $queryFactory
     * @param \HawkSearch\Proxy\Helper\Data $helper
     * @param array $data
     */
    public function __construct(
        Context $context,
        LayerResolver $layerResolver,
        Data $catalogSearchData,
        QueryFactory $queryFactory,
        \HawkSearch\Proxy\Helper\Data $helper,
        array $data = [])
    {
        $this->helper = $helper;
        parent::__construct($context, $layerResolver, $catalogSearchData, $queryFactory, $data);
    }

    public function getSearchQueryText()
    {
        $qt = $this->_getQuery()->getQueryText();
        if($qt == '') {
            return 'All Items';
        }
        return parent::getSearchQueryText();
    }

    public function getTemplateFile($template = null)
    {
        $this->setModuleName('Magento_CatalogSearch');
        return parent::getTemplateFile($template);
        $this->setModuleName('HawkSearch_Proxy');
    }
}

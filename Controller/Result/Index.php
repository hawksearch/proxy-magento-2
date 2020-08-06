<?php
/**
 * Copyright (c) 2020 Hawksearch (www.hawksearch.com) - All Rights Reserved
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

namespace HawkSearch\Proxy\Controller\Result;

use HawkSearch\Proxy\Helper\Data as ProxyHelper;
use HawkSearch\Proxy\Model\ConfigProvider;
use Magento\Catalog\Model\Layer\Resolver;
use Magento\Catalog\Model\Session;
use Magento\CatalogSearch\Helper\Data as CatalogSearchHelper;
use Magento\Framework\App\Action\Context;
use Magento\Search\Model\QueryFactory;
use Magento\Store\Model\StoreManagerInterface;

class Index extends \Magento\CatalogSearch\Controller\Result\Index
{
    private $queryFactory;
    private $request;
    /**
     * @var CatalogSearchHelper
     */
    private $catalogSearchHelper;
    /**
     * @var ProxyHelper
     */
    private $proxyHelper;

    /**
     * @var ConfigProvider
     */
    private $proxyConfigProvider;

    /**
     * Index constructor.
     * @param Context $context
     * @param Session $catalogSession
     * @param StoreManagerInterface $storeManager
     * @param QueryFactory $queryFactory
     * @param Resolver $layerResolver
     * @param CatalogSearchHelper $catalogSearchHelper
     * @param ProxyHelper $proxyHelper
     * @param ConfigProvider $proxyConfigProvider
     */
    public function __construct(
        Context $context,
        Session $catalogSession,
        StoreManagerInterface $storeManager,
        QueryFactory $queryFactory,
        Resolver $layerResolver,
        CatalogSearchHelper $catalogSearchHelper,
        ProxyHelper $proxyHelper,
        ConfigProvider $proxyConfigProvider
    ) {
        parent::__construct($context, $catalogSession, $storeManager, $queryFactory, $layerResolver);
        $this->queryFactory = $queryFactory;
        $this->request = $context->getRequest();
        $this->catalogSearchHelper = $catalogSearchHelper;
        $this->proxyHelper = $proxyHelper;
        $this->proxyConfigProvider = $proxyConfigProvider;
    }

    /**
     *
     * @throws \Magento\Framework\Exception\LocalizedException
     */
    public function execute()
    {
        if (!$this->proxyConfigProvider->isSearchManagementEnabled()) {
            parent::execute();
            return;
        }
        $query = $this->queryFactory->get();
        $this->catalogSearchHelper->checkNotes();
        if ($query->getQueryText() == '' && $this->isTopCategoryRequest()) {
            $this->_view->loadLayout();
            $this->_view->getLayout()->unsetElement('page.main.title');
        } else {

            if ($this->proxyHelper->productsOnly()) {
                $this->_view->loadLayout();
            } else {
                $this->_view->loadLayout('hawksearch_proxy_tabbed');
            }
        }
        $this->_view->getPage()->getConfig()->setRobots($this->proxyConfigProvider->getMetaRobots());
        $this->_view->renderLayout();
    }

    private function isTopCategoryRequest()
    {
        $params = $this->request->getParams();
        foreach (array_keys($params) as $key) {
            if (substr($key, 0, strlen('category')) == 'category') {
                return true;
            }
        }
        return false;
    }
}

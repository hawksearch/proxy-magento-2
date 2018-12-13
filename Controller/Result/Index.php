<?php
/**
 * Created by PhpStorm.
 * User: dev
 * Date: 8/29/18
 * Time: 10:59 AM
 */
namespace HawkSearch\Proxy\Controller\Result;

class Index extends \Magento\CatalogSearch\Controller\Result\Index
{
    private $queryFactory;
    private $request;
    /**
     * @var \Magento\CatalogSearch\Helper\Data
     */
    private $helper;
    /**
     * @var \HawkSearch\Proxy\Helper\Data
     */
    private $hawkHelper;

    public function __construct(
        \Magento\Framework\App\Action\Context $context,
        \Magento\Catalog\Model\Session $catalogSession,
        \Magento\Store\Model\StoreManagerInterface $storeManager,
        \Magento\Search\Model\QueryFactory $queryFactory,
        \Magento\Catalog\Model\Layer\Resolver $layerResolver,
        \Magento\CatalogSearch\Helper\Data $helper,
        \HawkSearch\Proxy\Helper\Data $hawkHelper)
    {
        $this->queryFactory = $queryFactory;
        $this->request = $context->getRequest();
        $this->helper = $helper;
        $this->hawkHelper = $hawkHelper;
        parent::__construct($context, $catalogSession, $storeManager, $queryFactory, $layerResolver);
    }

    /**
     *
     */
    public function execute()
    {
        $query = $this->queryFactory->get();
        $tab = $this->getRequest()->getParam('it');
        $this->helper->checkNotes();
        $this->_catalogSession->setHawkCurrentUpdateHandle($this->request->getFullActionName());

        if ($query->getQueryText() == '' && $this->isTopCategoryRequest()) {
            $this->_view->loadLayout();
            $this->_view->getLayout()->unsetElement('page.main.title');
            $this->_view->renderLayout();
        } elseif (!empty($tab) && $tab !== $this->hawkHelper->getResultType()) {
            $this->_view->loadLayout('hawksearch_proxy_tabbed');
            $this->_view->renderLayout();
        } else {
            // if no products, then load tabbed
            if ($this->hawkHelper->getProductCollection() == null) {
                $this->_view->loadLayout('hawksearch_proxy_tabbed');
            } else {
                $this->_view->loadLayout();
            }
            $this->_view->renderLayout();
        }
    }

    private function isTopCategoryRequest()
    {
        $params = $this->request->getParams();
        foreach (array_keys($params) as $key) {
            if(substr($key, 0, strlen('category')) == 'category') {
                return true;
            }
        }
        return false;
    }
}
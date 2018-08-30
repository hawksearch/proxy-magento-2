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
    
    public function __construct(\Magento\Framework\App\Action\Context $context, \Magento\Catalog\Model\Session $catalogSession, \Magento\Store\Model\StoreManagerInterface $storeManager, \Magento\Search\Model\QueryFactory $queryFactory, \Magento\Catalog\Model\Layer\Resolver $layerResolver)
    {
        $this->queryFactory = $queryFactory;
        $this->request = $context->getRequest();
        parent::__construct($context, $catalogSession, $storeManager, $queryFactory, $layerResolver);
    }

    /**
     *
     */
    public function execute()
    {
        $query = $this->queryFactory->get();
        if ($query->getQueryText() == '' && $this->isTopCategoryRequest()) {
            $this->_view->loadLayout();
            $this->_view->getLayout()->unsetElement('page.main.title');
            $this->_view->renderLayout();
        } else {
            parent::execute();
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
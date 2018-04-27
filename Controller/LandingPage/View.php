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
namespace HawkSearch\Proxy\Controller\LandingPage;

class View
    extends \Magento\Framework\App\Action\Action
{

    protected $resultPageFactory;
    private $session;
    /**
     * @var \Magento\Framework\Registry
     */
    private $coreRegistry;
    /**
     * @var \Magento\Catalog\Model\CategoryFactory
     */
    private $categoryFactory;
    /**
     * @var \HawkSearch\Proxy\Helper\Data
     */
    private $helper;


    /**
     * View constructor.
     * @param \Magento\Framework\App\Action\Context $context
     * @param \Magento\Catalog\Model\Session $session
     * @param \Magento\Framework\Registry $coreRegistry
     * @param \Magento\Catalog\Model\CategoryFactory $categoryFactory
     * @param \HawkSearch\Proxy\Helper\Data $helper
     * @param \Magento\Framework\View\Result\PageFactory $resultPageFactory
     */
    public function __construct(
        \Magento\Framework\App\Action\Context $context,
        \Magento\Catalog\Model\Session $session,
        \Magento\Framework\Registry $coreRegistry,
        \Magento\Catalog\Model\CategoryFactory $categoryFactory,
        \HawkSearch\Proxy\Helper\Data $helper,
        \Magento\Framework\View\Result\PageFactory $resultPageFactory
    )
    {
        parent::__construct($context);
        $this->resultPageFactory = $resultPageFactory;
        $this->session = $session;
        $this->coreRegistry = $coreRegistry;
        $this->categoryFactory = $categoryFactory;
        $this->helper = $helper;
    }


    public function execute()
    {
        $category = $this->categoryFactory->create();
        $category->setHawksearchLandingPage(true);
        $category->setName($this->helper->getResultData()->Name);
        $category->setHawkBreadcrumbPath([ 0 => [
            'label' => $category->getName(),
            'link' => ''
        ]]);

        $this->coreRegistry->register('current_category', $category);

        $page = $this->resultPageFactory->create();
        $page->getConfig()->addBodyClass('page-products');

        return $page;
    }
}

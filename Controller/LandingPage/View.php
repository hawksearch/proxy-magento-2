<?php
/**
 * Copyright (c) 2023 Hawksearch (www.hawksearch.com) - All Rights Reserved
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

use HawkSearch\Connector\Gateway\InstructionException;
use HawkSearch\Proxy\Helper\Data as ProxyHelper;
use Magento\Catalog\Model\CategoryFactory;
use Magento\Catalog\Model\Session;
use Magento\Framework\App\Action\Context;
use Magento\Framework\App\ResponseInterface;
use Magento\Framework\Controller\ResultInterface;
use Magento\Framework\Exception\NotFoundException;
use Magento\Framework\Registry;
use Magento\Framework\View\Result\Page;
use Magento\Framework\View\Result\PageFactory;

class View extends \Magento\Framework\App\Action\Action
{

    /**
     * @var PageFactory
     */
    protected $resultPageFactory;

    /**
     * @var Session
     */
    private $session;

    /**
     * @var Registry
     */
    private $coreRegistry;

    /**
     * @var CategoryFactory
     */
    private $categoryFactory;

    /**
     * @var ProxyHelper
     */
    private $helper;

    /**
     * View constructor.
     *
     * @param Context      $context
     * @param Session             $session
     * @param Registry                $coreRegistry
     * @param CategoryFactory     $categoryFactory
     * @param ProxyHelper $helper
     * @param PageFactory $resultPageFactory
     */
    public function __construct(
        Context $context,
        Session $session,
        Registry $coreRegistry,
        CategoryFactory $categoryFactory,
        ProxyHelper $helper,
        PageFactory $resultPageFactory
    ) {
        parent::__construct($context);
        $this->resultPageFactory = $resultPageFactory;
        $this->session = $session;
        $this->coreRegistry = $coreRegistry;
        $this->categoryFactory = $categoryFactory;
        $this->helper = $helper;
    }

    /**
     * @return ResponseInterface|ResultInterface|Page
     * @throws InstructionException
     * @throws NotFoundException
     */
    public function execute()
    {
        $category = $this->categoryFactory->create();
        $category->setData('hawksearch_landing_page', true);
        $data = $this->helper->getResultData();
        $category->setName($data->getHeaderTitle() ?: '-');
        $category->setData('hawk_breadcrumb_path',
            [ 0 => [
                'label' => $category->getName(),
                'link' => ''
            ]]
        );

        $this->coreRegistry->register('current_category', $category);

        $page = $this->resultPageFactory->create();
        $page->getConfig()->addBodyClass('page-products');

        return $page;
    }
}

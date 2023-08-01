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
namespace HawkSearch\Proxy\Controller\Index;

use HawkSearch\Proxy\Block\Html;
use HawkSearch\Proxy\Model\Config\Proxy as ProxyConfigProvider;
use Magento\Catalog\Model\Session;
use Magento\Framework\App\Action\Action;
use Magento\Framework\App\Action\Context;
use Magento\Framework\App\RequestInterface;
use Magento\Framework\App\ResponseInterface;
use Magento\Framework\Controller\Result\Json;
use Magento\Framework\Controller\Result\JsonFactory;
use Magento\Framework\Controller\Result\Raw;
use Magento\Framework\Controller\ResultInterface;

class Index extends Action
{

    /**
     * @var Raw
     */
    protected $result;

    /**
     * @var Session
     */
    private $session;

    /**
     * @var RequestInterface
     */
    private $request;

    /**
     * @var ProxyConfigProvider
     */
    private $proxyConfigProvider;

    /**
     * @var JsonFactory
     */
    private $resultJsonFactory;

    /**
     * Index constructor.
     * @param Context $context
     * @param Session $session
     * @param Raw $result
     * @param JsonFactory $resultJsonFactory
     * @param ProxyConfigProvider $proxyConfigProvider
     */
    public function __construct(
        Context $context,
        Session $session,
        Raw $result,
        JsonFactory $resultJsonFactory,
        ProxyConfigProvider $proxyConfigProvider
    ) {
        parent::__construct($context);
        $this->result = $result;
        $this->session = $session;
        $this->request = $context->getRequest();
        $this->resultJsonFactory = $resultJsonFactory;
        $this->proxyConfigProvider = $proxyConfigProvider;
    }

    /**
     * @return ResponseInterface|Raw|ResultInterface
     */
    public function execute()
    {
        $tab = $this->getRequest()->getParam('it');
        $html = '';

        if (!$this->_view->isLayoutLoaded()) {
            $this->_view->loadLayout();
            /** @var Html $block */
            $block = $this->_view->getLayout()->getBlock('hawksearch_proxy_response');
            if (!empty($tab)
                && !empty($this->proxyConfigProvider->getResultType())
                && $tab !== $this->proxyConfigProvider->getResultType()
            ) {
                $block->setTabbedContent(true);
            }
            $html = $block->toHtml();
        }
        $result = [
            'success' => 'true',
            'html' => $html,
            'multiple_wishlist' => $this->_view->getLayout()->getBlock('wishlist_behaviour')
                ? $this->_view->getLayout()->getBlock('wishlist_behaviour')->toHtml()
                : '',
            'location' => ''
        ];

        /** @var Json $resultJson */
        $resultJson = $this->resultJsonFactory->create();
        return $resultJson->setData($result);
    }
}

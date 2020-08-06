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
namespace HawkSearch\Proxy\Controller\Index;

use HawkSearch\Proxy\Model\ConfigProvider;
use Magento\Catalog\Model\Session;
use Magento\Framework\App\Action\Action;
use Magento\Framework\App\Action\Context;
use Magento\Framework\Controller\Result\Raw;

class Index extends Action
{

    protected $result;
    private $session;
    private $request;

    /**
     * @var ConfigProvider
     */
    private $proxyConfigProvider;

    /**
     * Index constructor.
     * @param Context $context
     * @param Session $session
     * @param Raw $result
     * @param ConfigProvider $proxyConfigProvider
     */
    public function __construct(
        Context $context,
        Session $session,
        Raw $result,
        ConfigProvider $proxyConfigProvider
    ) {
        parent::__construct($context);
        $this->result = $result;
        $this->session = $session;
        $this->request = $context->getRequest();
        $this->proxyConfigProvider = $proxyConfigProvider;
    }
    public function execute()
    {
        $tab = $this->getRequest()->getParam('it');
        $html = '';

        if (!$this->_view->isLayoutLoaded()) {
            $this->_view->loadLayout();
            $block = $this->_view->getLayout()->getBlock('hawksearch_proxy_response');
            if (!empty($tab)
                && !empty($this->proxyConfigProvider->getResultType())
                && $tab !== $this->proxyConfigProvider->getResultType()
            ) {
                $block->setTabbedContent(true);
            }
            $html = $block->toHtml();
        }
        $params = $this->getRequest()->getParams();
        $obj = ['Success' => 'true', 'html' => $html, 'location' => ''];

        $this->result->setHeader('Content-Type', 'application/javascript');
        $this->result->setContents($params['callback'] . '(' . json_encode($obj) . ')');

        return $this->result;
    }
}

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
namespace HawkSearch\Proxy\Controller\Index;

class Index
    extends \Magento\Framework\App\Action\Action
{

    protected $resultPageFactory;
    private $session;


    public function __construct(\Magento\Framework\App\Action\Context $context,
                                \Magento\Catalog\Model\Session $session,
                                \Magento\Framework\View\Result\PageFactory $resultPageFactory)
    {
        $this->resultPageFactory = $resultPageFactory;
        $this->session = $session;
        parent::__construct($context);
    }


    public function execute()
    {
        if($this->_view->isLayoutLoaded()){
            $this->_view->loadLayout($this->session->getHawkCurrentUpdateHandle());
        }
        $html = $this->_view->getLayout()->createBlock('HawkSearch\Proxy\Block\Html')->setTemplate('HawkSearch_Proxy::hawksearch/proxy/html.phtml')->toHtml();
        $params = $this->getRequest()->getParams();
        $obj = array('Success' => 'true', 'html' => $html, 'location' => '');

        $result = $this->resultFactory->create(\Magento\Framework\Controller\ResultFactory::TYPE_RAW);
        $result->setHeader('Content-Type', 'text/html');
        $result->setContents($params['callback'] . '(' . json_encode($obj) . ')');

        return $result;
    }
}

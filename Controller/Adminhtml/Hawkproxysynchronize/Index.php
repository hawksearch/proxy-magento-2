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
namespace HawkSearch\Proxy\Controller\Adminhtml\Hawkproxysynchronize;

use Magento\Backend\App\Action\Context;
use Magento\Framework\App\ResponseInterface;
use Magento\Framework\View\Result\PageFactory;

class Index
    extends \Magento\Backend\App\Action
{
    /**
     * @var \Magento\Framework\Controller\Result\JsonFactory
     */
    protected $resultJsonFactory;
    /** @var \HawkSearch\Proxy\Helper\Data $helper */
    protected $dataHelper;

    /**
     * @param Context $context
     * @param \Magento\Framework\Controller\Result\JsonFactory $resultJsonFactory
     */
    public function __construct(
        Context $context,
        \Magento\Framework\Controller\Result\JsonFactory $resultJsonFactory,
        \HawkSearch\Proxy\Helper\Data $dataHelper
    )
    {
        parent::__construct($context);
        $this->resultJsonFactory = $resultJsonFactory;
        $this->dataHelper = $dataHelper;
    }

    /**
     * @return \Magento\Framework\Controller\Result\Json
     */
    public function execute()
    {
        $disabledFuncs = explode(',', ini_get('disable_functions'));
        $isShellDisabled = is_array($disabledFuncs) ? in_array('shell_exec', $disabledFuncs) : true;
        $isShellDisabled = (stripos(PHP_OS, 'win') === false) ? $isShellDisabled : true;

        if ($isShellDisabled) {
            return $this->resultJsonFactory->create()->setData([
                'error' => 'This installation cannot run one-off category synchronizations because the PHP function "shell_exec" has been disabled. Please use cron.']);
        } else {
            if (strtolower($this->getRequest()->getParam('force')) == 'true') {
                $this->dataHelper->removeSyncLocks();
            }
            $this->dataHelper->launchSyncProcess();
        }
        return $this->resultJsonFactory->create()->setData(['error' => 'false']);
    }
}
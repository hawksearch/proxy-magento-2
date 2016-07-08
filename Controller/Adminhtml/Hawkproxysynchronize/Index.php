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
use Magento\Framework\View\Result\PageFactory;
 
class Index extends \Magento\Backend\App\Action
{
    /**
     * @var PageFactory
     */
    protected $resultPageFactory;
 
    /**
     * @param Context $context
     * @param PageFactory $resultPageFactory
     */
    public function __construct(
        Context $context,
        PageFactory $resultPageFactory
    ) {
        parent::__construct($context);
        $this->resultPageFactory = $resultPageFactory;
    }
 
    /**
     * Index action
     *
     * @return void
     */
    public function execute()
    {
        /** @var \Magento\Backend\Model\View\Result\Page $resultPage */
      $response = array("error" => false);

		try {
			$disabledFuncs = explode(',', ini_get('disable_functions'));
			$isShellDisabled = is_array($disabledFuncs) ? in_array('shell_exec', $disabledFuncs) : true;
			$isShellDisabled = (stripos(PHP_OS, 'win') === false) ? $isShellDisabled : true;

			if($isShellDisabled) {
				$response['error'] = 'This installation cannot run one off category synchronizations because the PHP function "shell_exec" has been disabled. Please use cron.';
			} else {
				
				 /** @var HawkSearch\Proxy\Helper\Data $helper */	
				$object_manager = \Magento\Framework\App\ObjectManager::getInstance();
				$helper = $object_manager->get('HawkSearch\Proxy\Helper\Data'); 
		
				if(strtolower($this->getRequest()->getParam('force')) == 'true') {
					$helper->removeSyncLocks();
				}
				$helper->launchSyncProcess();
			}
		}
		catch (Exception $e) {
			$response['error'] = $e;
			
		}
		$this->getResponse()
			->setHeader("Content-Type", "application/json")
			->setBody(json_encode($response));
    }
}
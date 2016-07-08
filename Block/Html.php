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
namespace HawkSearch\Proxy\Block;
use Magento\Framework\View\Element\Template;
/**
 *  Html block
 */
class Html extends Template
{
    
   private $helper;

   function _construct() {
	  
	 
/** @var $this->helper \HawkSearch\Proxy\Helper\Data */
	   $om=\Magento\Framework\App\ObjectManager::getInstance();
		$this->helper =$om->get('HawkSearch\Proxy\Helper\Data');
		$this->helper->setUri($this->getRequest()->getParams());
		$this->helper->setClientIp($this->getRequest()->getClientIp());
		$this->helper->setClientUa($om->create('Magento\Framework\HTTP\Header')->getHttpUserAgent());
		$this->helper->setIsHawkManaged(true);
		return parent::_construct();
	}
function getFacets() {
	
		return $this->helper->getResultData()->Data->Facets;
	}
	
	function getTopPager() {
		return $this->helper->getResultData()->Data->TopPager;
	}
	function getBottomPager() {
		return $this->helper->getResultData()->Data->BottomPager;
	}
	function getMetaRobots() {
		return $this->helper->getResultData()->MetaRobots;
	}
	function getHeaderTitle() {
		return $this->helper->getResultData()->HeaderTitle;
	}
	function getMetaDescription() {
		return $this->helper->getResultData()->MetaDescription;
	}
	function getMetaKeywords() {
		return $this->helper->getResultData()->MetaKeywords;
	}
	function getRelCanonical() {
		return $this->helper->getResultData()->RelCanonical;
	}
	function getTopText() {
		return $this->helper->getResultData()->Data->TopText;
	}
	function getRelated() {
		return $this->helper->getResultData()->Data->Related;
	}
	function getBreadCrumb() {
		return $this->helper->getResultData()->Data->BreadCrumb;
	}
	function getTitle() {
		return $this->helper->getResultData()->Data->Title;
	}
	
	function getItemList() {
		
		
		$html =$this->getLayout()
            ->createBlock('HawkSearch\Proxy\Block\Product\ListProduct')
            ->setTemplate('Magento_Catalog::product/list.phtml')
            ->toHtml();
			
			return $html;
		
	}
    
}

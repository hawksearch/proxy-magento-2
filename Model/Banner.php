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
namespace HawkSearch\Proxy\Model;
class Banner extends \Magento\Framework\DataObject {

	protected function _construct() {
		
		 /** @var \HawkSearch\Proxy\Helper\Data $helper */
		$om=\Magento\Framework\App\ObjectManager::getInstance();		
		$helper=$om->create('HawkSearch\Proxy\Helper\Data');
		foreach($helper->getResultData()->Data->Merchandising->Items as $banner) {
			$this->setData($this->_underscore($banner->Zone), $banner->Html);
		}
        foreach($helper->getResultData()->Data->FeaturedItems->Items as $banner) {
            $this->setData($this->_underscore($banner->Zone), $banner->Html);
        }
	}
}
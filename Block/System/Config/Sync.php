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
namespace HawkSearch\Proxy\Block\System\Config;
use Magento\Framework\App\Config\ScopeConfigInterface;
class Sync extends \Magento\Config\Block\System\Config\Form\Field
{
    /**
     * Path to block template
     */

    /**
     * Set template to itself
     *
     * @return $this
     */
	 

	 
	 
 protected function _prepareLayout()
    {
        parent::_prepareLayout();
        if (!$this->getTemplate()) {
              $this->setTemplate('HawkSearch_Proxy::system/config/button/sync.phtml');
        }
        return $this;
    }
   /**
     * Render button
     *
     * @param  \Magento\Framework\Data\Form\Element\AbstractElement $element
     * @return string
     */
    public function render(\Magento\Framework\Data\Form\Element\AbstractElement $element)
    {
        // Remove scope label
        $element->unsScope()->unsCanUseWebsiteValue()->unsCanUseDefaultValue();
        return parent::render($element);
    }
    /**
     * Get the button and scripts contents
     *
     * @param \Magento\Framework\Data\Form\Element\AbstractElement $element
     * @return string
     */
    protected function _getElementHtml(\Magento\Framework\Data\Form\Element\AbstractElement $element)
    {
        $originalData = $element->getOriginalData();
        $this->addData(
            [
             
				'button_label' =>$originalData['button_label'],
                'intern_url' => $this->getUrl($originalData['button_url']),               
                'html_id' => $element->getHtmlId(),
            ]
        );
        return $this->_toHtml();
    }
}
 
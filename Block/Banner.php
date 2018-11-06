<?php
/**
 * Copyright (c) 2017 Hawksearch (www.hawksearch.com) - All Rights Reserved
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

class Banner extends Template {
    /**
     * @var \HawkSearch\Proxy\Helper\Data
     */
    private $helper;

    public function __construct(
        \HawkSearch\Proxy\Helper\Data $helper,
        Template\Context $context,
        array $data = []
    )
    {
        $this->helper = $helper;
        parent::__construct($context, $data);
    }

    protected function _construct() {
        $resultData = $this->helper->getResultData()->Data;
        if(isset($resultData->Merchandising) && isset($resultData->Merchandising->Items)) {
            foreach($resultData->Merchandising->Items as $banner) {
                $this->setData($this->_underscore($banner->Zone), $banner->Html);
            }
        }
        if(isset($resultData->FeaturedItems) && isset($resultData->FeaturedItems->Items)) {
            foreach($this->helper->getResultData()->Data->FeaturedItems->Items as $banner) {
                $this->setData($this->_underscore($banner->Zone), $banner->Html);
            }
        }
	}
}
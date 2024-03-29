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
namespace HawkSearch\Proxy\Block;

use HawkSearch\Connector\Gateway\InstructionException;
use HawkSearch\Proxy\Helper\Data as ProxyHelper;
use Magento\Framework\Exception\NotFoundException;
use Magento\Framework\View\Element\Template;

class Banner extends Template
{
    /**
     * @var ProxyHelper
     */
    private $helper;

    /**
     * Banner constructor.
     * @param ProxyHelper $helper
     * @param Template\Context $context
     * @param array $data
     */
    public function __construct(
        ProxyHelper $helper,
        Template\Context $context,
        array $data = []
    ) {
        $this->helper = $helper;
        parent::__construct($context, $data);
    }

    /**
     * @throws InstructionException
     * @throws NotFoundException
     */
    protected function _construct()
    {
        $resultData = $this->helper->getResultData()->getResponseData();
        if ($resultData->getMerchandising()) {
            foreach ($resultData->getMerchandising()->getItems() as $banner) {
                $this->setData($this->_underscore($banner->getZone()), $banner->getHtml());
            }
        }
        if ($resultData->getFeaturedItems()->getItems()) {
            foreach ($resultData->getFeaturedItems()->getItems() as $banner) {
                $this->setData($this->_underscore($banner->getZone()), $banner->getHtml());
            }
        }
    }

    /**
     * @param string $zone
     */
    public function setZone(string $zone)
    {
        $this->setData('zone', $zone);
    }

    /**
     * @return string
     */
    public function getZone()
    {
        return $this->getData('zone');
    }

    /**
     * @inheritDoc
     */
    protected function _toHtml()
    {
        if (false != $this->getTemplate()) {
            return parent::_toHtml();
        }

        $html = '';
        if ($this->getZone()) {
            $html = $this->getZoneHtml($this->getZone());
        }

        return $html;
    }

    /**
     * @param $zone
     * @return string|null
     * @throws InstructionException
     * @throws NotFoundException
     */
    protected function getZoneHtml($zone)
    {
        $html = '';
        $resultData = $this->helper->getResultData()->getResponseData();
        foreach ($resultData->getMerchandising()->getItems() as $banner) {
            if ($banner->getZone() != $zone) {
                continue;
            }
            $html = $banner->getHtml();
            break;
        }
        return $html;
    }

}

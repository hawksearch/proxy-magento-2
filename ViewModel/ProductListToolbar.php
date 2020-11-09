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

declare(strict_types=1);

namespace HawkSearch\Proxy\ViewModel;

use HawkSearch\Proxy\Helper\Data as ProxyHelper;
use Magento\Framework\View\Element\Block\ArgumentInterface;
use Magento\Store\Model\StoreManagerInterface;

class ProductListToolbar implements ArgumentInterface
{
    /**
     * @var ProxyHelper
     */
    private $hawkHelper;

    /**
     * @var StoreManagerInterface
     */
    private $storeManager;

    /**
     * ProductListToolbar constructor.
     * @param ProxyHelper $hawkHelper
     * @param StoreManagerInterface $storeManager
     */
    public function __construct(
        ProxyHelper $hawkHelper,
        StoreManagerInterface $storeManager
    ) {
        $this->hawkHelper = $hawkHelper;
        $this->storeManager = $storeManager;
    }

    /**
     * @return string
     * @throws \HawkSearch\Connector\Gateway\InstructionException
     * @throws \Magento\Framework\Exception\NoSuchEntityException
     * @throws \Magento\Framework\Exception\NotFoundException
     */
    public function getTopToolbarHtml()
    {
        return $this->renderToolbarHtml($this->hawkHelper->getResultData()->getResponseData()->getTopPager());
    }

    /**
     * @return string
     * @throws \HawkSearch\Connector\Gateway\InstructionException
     * @throws \Magento\Framework\Exception\NoSuchEntityException
     * @throws \Magento\Framework\Exception\NotFoundException
     */
    public function getBottomToolbarHtml()
    {
        return $this->renderToolbarHtml($this->hawkHelper->getResultData()->getResponseData()->getBottomPager());
    }

    /**
     * @param $html
     * @return string
     * @throws \Magento\Framework\Exception\NoSuchEntityException
     */
    private function renderToolbarHtml($html)
    {
        $baseUrl = $this->storeManager->getStore()->getBaseUrl();
        return str_replace(
            $baseUrl . '/',
            $baseUrl,
            $html
        );
    }
}

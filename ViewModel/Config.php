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

namespace HawkSearch\Proxy\ViewModel;

use HawkSearch\Connector\Model\Config\ApiSettings;
use HawkSearch\Proxy\Helper\Data as ProxyHelper;
use HawkSearch\Proxy\Model\Config\Proxy as ProxyConfigProvider;
use Magento\Framework\UrlInterface;
use Magento\Framework\View\Element\Block\ArgumentInterface;


class Config implements ArgumentInterface
{
    /**
     * @var ProxyConfigProvider
     */
    private $proxyConfigProvider;

    /**
     * @var UrlInterface
     */
    private $urlBuilder;

    /**
     * @var ProxyHelper
     */
    private $proxyHelper;

    /**
     * @var ApiSettings
     */
    private $apiSettingsConfigProvider;

    /**
     * Footer constructor.
     * @param ProxyConfigProvider $proxyConfigProvider
     * @param UrlInterface $urlBuilder
     * @param ProxyHelper $proxyHelper
     * @param ApiSettings $apiSettingsConfigProvider
     */
    public function __construct(
        ProxyConfigProvider $proxyConfigProvider,
        UrlInterface $urlBuilder,
        ProxyHelper $proxyHelper,
        ApiSettings $apiSettingsConfigProvider
    ) {
        $this->proxyConfigProvider = $proxyConfigProvider;
        $this->urlBuilder = $urlBuilder;
        $this->proxyHelper = $proxyHelper;
        $this->apiSettingsConfigProvider = $apiSettingsConfigProvider;
    }

    /**
     * @return string
     */
    public function getBaseUrl()
    {
        return $this->urlBuilder->getUrl('hawkproxy');
    }

    /**
     * @param string $path
     * @return string|null
     */
    public function getHawkUrl($path = '')
    {
        return $this->proxyHelper->getSearchUrl($path);
    }

    /**
     * @return string|null
     */
    public function getTrackingUrl()
    {
        return $this->apiSettingsConfigProvider->getTrackingUrl();
    }

    /**
     * @return string|null
     */
    public function getRecommendedUrl()
    {
        return $this->apiSettingsConfigProvider->getRecommendationUrl();
    }

    /**
     * @return string|null
     */
    public function getTrackingKey()
    {
        return $this->apiSettingsConfigProvider->getOrderTrackingKey();
    }

    /**
     * @return array
     */
    public function getSearchBoxes()
    {
        return $this->proxyConfigProvider->getSearchBoxIds();
    }

    /**
     * @return string|null
     */
    public function getHiddenDivName()
    {
        return $this->proxyConfigProvider->getAutocompleteDivId();
    }

    /**
     * @return string|null
     */
    public function getAutosuggestionParams()
    {
        return $this->proxyConfigProvider->getAutocompleteQueryParams();
    }

    /**
     * @return bool
     */
    public function isHawkCssIncluded(): ?bool
    {
        return $this->proxyConfigProvider->isHawkCssIncluded();
    }
}

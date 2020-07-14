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

use HawkSearch\Proxy\Model\ConfigProvider as ProxyConfigProvider;
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
     * Footer constructor.
     * @param ProxyConfigProvider $proxyConfigProvider
     * @param UrlInterface $urlBuilder
     */
    public function __construct(
        ProxyConfigProvider $proxyConfigProvider,
        UrlInterface $urlBuilder
    ) {
        $this->proxyConfigProvider = $proxyConfigProvider;
        $this->urlBuilder = $urlBuilder;
    }

    /**
     * @return string
     */
    public function getBaseUrl()
    {
        return $this->urlBuilder->getUrl('hawkproxy');
    }

    /**
     * @return string|null
     */
    public function getHawkUrl()
    {
        return $this->proxyConfigProvider->getHawkUrl();
    }

    /**
     * @return string|null
     */
    public function getTrackingUrl()
    {
        return $this->proxyConfigProvider->getTrackingUrl();
    }

    /**
     * @return string|null
     */
    public function getRecommendedUrl()
    {
        return $this->proxyConfigProvider->getRecommendedUrl();
    }

    /**
     * @return string|null
     */
    public function getTrackingKey()
    {
        return $this->proxyConfigProvider->getOrderTrackingKey();
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
    public function isHawkCssIncluded() : ?bool
    {
        return $this->proxyConfigProvider->isHawkCssIncluded();
    }
}

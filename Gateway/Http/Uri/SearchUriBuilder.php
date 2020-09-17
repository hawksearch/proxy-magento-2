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

namespace HawkSearch\Proxy\Gateway\Http\Uri;

use HawkSearch\Connector\Gateway\Http\Uri\UriBuilderInterface;
use HawkSearch\Connector\Helper\Url as UrlUtility;
use HawkSearch\Connector\Model\Config\ApiSettings as ApiSettingsProvider;

class SearchUriBuilder implements UriBuilderInterface
{
    /**
     * Engine part identification in URI
     */
    const PATH_SITES = 'sites';

    /**
     * @var ApiSettingsProvider
     */
    private $apiSettingsProvider;

    /**
     * @var UrlUtility
     */
    private $urlUtility;

    /**
     * SearchUriBuilder constructor.
     * @param ApiSettingsProvider $apiSettingsProvider
     * @param UrlUtility $urlUtility
     */
    public function __construct(
        ApiSettingsProvider $apiSettingsProvider,
        UrlUtility $urlUtility
    ) {
        $this->apiSettingsProvider = $apiSettingsProvider;
        $this->urlUtility = $urlUtility;
    }

    /**
     * @inheritDoc
     */
    public function build(string $url, string $path): string
    {
        $url = $this->urlUtility->getUriWithPath($url, $path);

        return $this->urlUtility->addToUriPath(
            $url,
            [
                static::PATH_SITES,
                $this->apiSettingsProvider->getEngineName()
            ]
        )->__toString();
    }
}

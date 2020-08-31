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
     * SearchUriBuilder constructor.
     * @param ApiSettingsProvider $apiSettingsProvider
     */
    public function __construct(
        ApiSettingsProvider $apiSettingsProvider
    ) {
        $this->apiSettingsProvider = $apiSettingsProvider;
    }

    /**
     * @inheritDoc
     */
    public function build(string $url, string $path): string
    {
        $url = rtrim($url, '/') . '/' . ltrim($path, '/');
        $parsedUrl = parse_url($url);
        $parsedUrl['path'] = $this->addEngineToPath($parsedUrl['path'] ?? '');

        return $this->combineUrl($parsedUrl);
    }

    /**
     * Analyze URI path and add engine parameter if it is needed
     * Minimum $path string expected is "/"
     * @param string $path
     * @return string
     */
    private function addEngineToPath(string $path)
    {
        $pathParts = isset($path) ? explode('/', $path) : [];

        //Expects "/" as a minimum path
        if (count($pathParts) < 2) {
            return $path;
        } elseif (count($pathParts) == 2 && $pathParts[1] == '') {
            array_pop($pathParts);
        }

        if (isset($pathParts[1]) && $pathParts[1] == static::PATH_SITES) {
            return $path;
        }

        $pathStart = [];
        while (count($pathStart) < 1) {
            $pathStart[] = array_shift($pathParts);
        }

        array_unshift($pathParts, static::PATH_SITES, $this->apiSettingsProvider->getEngineName());
        $pathParts = array_merge($pathStart, $pathParts);

        return implode('/', $pathParts);
    }

    /**
     * @param array $parsedUrl
     * @return string
     */
    private function combineUrl($parsedUrl)
    {
        $scheme   = isset($parsedUrl['scheme']) ? $parsedUrl['scheme'] . '://' : '';
        $host     = isset($parsedUrl['host']) ? $parsedUrl['host'] : '';
        $port     = isset($parsedUrl['port']) ? ':' . $parsedUrl['port'] : '';
        $user     = isset($parsedUrl['user']) ? $parsedUrl['user'] : '';
        $pass     = isset($parsedUrl['pass']) ? ':' . $parsedUrl['pass']  : '';
        $pass     = ($user || $pass) ? "$pass@" : '';
        $path     = isset($parsedUrl['path']) ? $parsedUrl['path'] : '';
        $query    = isset($parsedUrl['query']) ? '?' . $parsedUrl['query'] : '';
        $fragment = isset($parsedUrl['fragment']) ? '#' . $parsedUrl['fragment'] : '';
        return "$scheme$user$pass$host$port$path$query$fragment";
    }
}

<?php
/**
 *  Copyright (c) 2020 Hawksearch (www.hawksearch.com) - All Rights Reserved
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 *  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 *  IN THE SOFTWARE.
 */
declare(strict_types=1);

namespace HawkSearch\Proxy\Gateway\Request;

use HawkSearch\Connector\Gateway\Request\BuilderInterface;
use HawkSearch\Connector\Model\ConfigProvider as ConnectorConfigProvider;
use HawkSearch\Proxy\Helper\Data;
use HawkSearch\Proxy\Model\Config\Proxy as ProxyConfigProvider;
use Magento\Catalog\Model\Session as CatalogSession;
use Magento\Framework\App\RequestInterface;

class SearchParametersBuilder implements BuilderInterface
{
    /**
     * @var RequestInterface
     */
    private $httpRequest;

    /**
     * @var ConnectorConfigProvider
     */
    private $connectorConfigProvider;

    /**
     * @var ProxyConfigProvider
     */
    private $proxyConfigProvider;

    /**
     * @var CatalogSession
     */
    private $catalogSession;

    /**
     * @var Data
     */
    private $helper;

    /**
     * SearchParamsBuilder constructor.
     * @param RequestInterface $httpRequest
     * @param ConnectorConfigProvider $connectorConfigProvider
     * @param ProxyConfigProvider $proxyConfigProvider
     * @param CatalogSession $catalogSession
     * @param Data $helper
     */
    public function __construct(
        RequestInterface $httpRequest,
        ConnectorConfigProvider $connectorConfigProvider,
        ProxyConfigProvider $proxyConfigProvider,
        CatalogSession $catalogSession,
        Data $helper

    ) {
        $this->httpRequest = $httpRequest;
        $this->connectorConfigProvider = $connectorConfigProvider;
        $this->proxyConfigProvider = $proxyConfigProvider;
        $this->catalogSession = $catalogSession;
        $this->helper = $helper;
    }

    /**
     * @inheritDoc
     */
    public function build(array $buildSubject)
    {
        // define default params' values
        $params = [
            'output' => 'custom',
            'hawkitemlist' => 'json',
            'hawkfeatured' => 'json',
            'lpurl' => '', //TODO
        ];

        $params = array_merge($params, $buildSubject);

        if ($this->proxyConfigProvider->showTabs()) {
            $params['hawktabs'] = 'html';
        }

        if (empty($buildSubject['it']) && $this->proxyConfigProvider->getResultType()) {
            $params['it'] = $this->proxyConfigProvider->getResultType();
        } else {
            $params['it'] = $buildSubject['it'];
        }

        $params['HawkSessionId'] = $this->catalogSession->getSessionId();

        if (isset($buildSubject['q'])) {
            $params['q'] = $buildSubject['q'];
        }
        $this->manageLandingPageParam($params, $buildSubject)
            ->sanitizeParams($params);

        return $params;
    }

    /**
     * Modify $params array and add `lpurl` param conditionally
     * @param array $params
     * @param array $buildSubject
     * @return SearchParametersBuilder
     */
    private function manageLandingPageParam(&$params, $buildSubject)
    {
        $controller = implode('_', [$this->httpRequest->getModuleName(), $this->httpRequest->getControllerName()]);
        if (isset($buildSubject['lpurl'])) {
            $buildSubject['lpurl'] = rtrim($buildSubject['lpurl'], "/");
        }
        switch ($controller) {
            case 'hawkproxy_landingPage':
                if ($this->proxyConfigProvider->isLandingPageRouteEnabled()) {
                    $params['lpurl'] = $this->httpRequest->getAlias('rewrite_request_path');
                }
                break;
            case 'catalog_category':
                if ($this->proxyConfigProvider->isManageCategories()) {
                    $params['lpurl'] = empty($buildSubject['lpurl'])
                        ? $this->httpRequest->getAlias('rewrite_request_path')
                        : $buildSubject['lpurl'];
                }
                break;
            case 'hawkproxy_index':
                if (!(isset($buildSubject['lpurl'])
                    && (
                        substr(
                            $buildSubject['lpurl'],
                            0,
                            strlen('/catalogsearch/result')
                        ) === '/catalogsearch/result'
                    ))
                ) {
                    $params['lpurl'] = $buildSubject['lpurl'];
                }
                break;
            default:
                //do nothing
        }

        if (isset($params['lpurl']) && (!$this->helper->getIsHawkManaged($params['lpurl'])
                || $params['lpurl'] == '/catalogsearch/result/')
        ) {
            unset($params['lpurl']);
        }

        return $this;
    }

    /**
     * Remove unused parameters from the API URL query params
     * @param $params
     * @return SearchParametersBuilder
     */
    private function sanitizeParams(&$params)
    {
        unset($params['ajax']);
        unset($params['json']);

        return $this;
    }
}

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

namespace HawkSearch\Proxy\Controller;

use HawkSearch\Proxy\Model\Config\Proxy as ProxyConfigProvider;
use Magento\Framework\App\Action\Forward;
use Magento\Framework\App\ActionFactory;
use Magento\Framework\App\RequestInterface;
use Magento\Framework\App\RouterInterface;

class SearchRouter implements RouterInterface
{
    /**
     * @var ActionFactory
     */
    protected $actionFactory;

    /**
     * @var ProxyConfigProvider
     */
    private $proxyConfigProvider;

    /**
     * @param ActionFactory $actionFactory
     * @param ProxyConfigProvider $proxyConfigProvider
     */
    public function __construct(
        ActionFactory $actionFactory,
        ProxyConfigProvider $proxyConfigProvider
    )
    {
        $this->actionFactory = $actionFactory;
        $this->proxyConfigProvider = $proxyConfigProvider;
    }

    /**
     * Hawk custom router
     * @inheritDoc
     */
    public function match(RequestInterface $request)
    {
        if (!$this->proxyConfigProvider->isCustomSearchRouteEnabled()) {
            return false;
        }
        $stem = (string)$this->proxyConfigProvider->getCustomSearchRoute();
        $parts = explode('/', trim($request->getPathInfo(), '/'));
        $identifier = (string)array_shift($parts);

        if (strpos($identifier, $stem) !== false) {
            $request->setModuleName('catalogsearch')
                ->setControllerName('result')
                ->setActionName('index')
                ->setParam('q', implode(' ', $parts));
        } else {
            return false;
        }

        /*
         * We have match and now we will forward action
         */
        return $this->actionFactory->create(
            Forward::class
        );
    }
}

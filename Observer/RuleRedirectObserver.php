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
declare(strict_types=1);

namespace HawkSearch\Proxy\Observer;

use HawkSearch\Proxy\Helper\Data as ProxyHelper;
use HawkSearch\Proxy\Model\Provider\ResponseProviderInterface;
use Magento\Framework\App\Action\Action;
use Magento\Framework\App\RequestInterface;
use Magento\Framework\Event\Observer;
use Magento\Framework\Event\ObserverInterface;

class RuleRedirectObserver implements ObserverInterface
{
    /**
     * @var ResponseProviderInterface
     */
    private $responseProvider;

    /**
     * @var ProxyHelper
     */
    private $proxyHelper;

    /**
     * RuleRedirectObserver constructor.
     * @param ResponseProviderInterface $responseProvider
     * @param ProxyHelper $proxyHelper
     */
    public function __construct(
        ResponseProviderInterface $responseProvider,
        ProxyHelper $proxyHelper
    ){
        $this->responseProvider = $responseProvider;
        $this->proxyHelper = $proxyHelper;
    }

    /**
     * @inheritdoc
     */
    public function execute(Observer $observer)
    {
        /** @var RequestInterface $request */
        $request = $observer->getData('request');
        if ($this->proxyHelper->getIsHawkManaged()
            && $this->proxyHelper->getResultData()->getLocation()
        ) {
            /** @var Action $controller */
            $controller = $observer->getData('controller_action');
            $this->responseProvider->execute($controller->getResponse());
        }
    }
}

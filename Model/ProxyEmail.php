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

namespace HawkSearch\Proxy\Model;

use Magento\Framework\App\Action\Context;
use Magento\Framework\App\Area;
use Magento\Framework\App\Config\ScopeConfigInterface;
use Magento\Framework\Exception\LocalizedException;
use Magento\Framework\Exception\MailException;
use Magento\Framework\Mail\Template\TransportBuilder;
use Magento\Store\Model\Store;
use Magento\Store\Model\StoreManagerInterface;

class ProxyEmail
{

    /**
     * @var TransportBuilder
     */
    protected $transportBuilder;

    /**
     * @var ScopeConfigInterface
     */
    protected $scopeConfig;

    /**
     * @var StoreManagerInterface
     */
    protected $storeManager;
    /**
     * @param Context              $context
     * @param TransportBuilder  $transportBuilder
     * @param ScopeConfigInterface $scopeConfig
     * @param StoreManagerInterface         $storeManager
     */
    public function __construct(
        Context $context,
        TransportBuilder $transportBuilder,
        ScopeConfigInterface $scopeConfig,
        StoreManagerInterface $storeManager
    ) {
        $this->transportBuilder = $transportBuilder;
        $this->scopeConfig = $scopeConfig;
        $this->storeManager = $storeManager;
    }

    /**
     * @param $templateParams
     * @throws LocalizedException
     * @throws MailException
     */
    public function sendEmail($templateParams)
    {
        $transport = $this->transportBuilder
            ->setTemplateIdentifier('hawksearch_proxy_email')
            ->setTemplateOptions(
                [
                    'area' => Area::AREA_FRONTEND,
                    'store' => Store::DEFAULT_STORE_ID,
                ]
            )
            ->setTemplateVars($templateParams)
            ->setFrom(
                [
                'name' => $this->scopeConfig->getValue('trans_email/ident_general/name'),
                'email' => $this->scopeConfig->getValue('trans_email/ident_general/email')
                ]
            )
            ->addTo(
                array_map(
                    function ($a) {
                        if (preg_match('/(.*?) <(.*?)>/', trim($a), $m)) {
                            return [$m[1] => $m[2]];
                        }
                        return trim($a);
                    },
                    explode(',', (string)$this->scopeConfig->getValue('hawksearch_proxy/sync/email'))
                )
            )
            ->getTransport();
        $transport->sendMessage();
    }
}

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

class ProxyEmail
{

    /**
     * @var \Magento\Framework\Mail\Template\TransportBuilder
     */
    protected $transportBuilder;

    /**
     * @var \Magento\Framework\App\Config\ScopeConfigInterface
     */
    protected $scopeConfig;

    /**
     * @var \Magento\Store\Model\StoreManagerInterface
     */
    protected $storeManager;
    /**
     * @param \Magento\Framework\App\Action\Context              $context
     * @param \Magento\Framework\Mail\Template\TransportBuilder  $transportBuilder
     * @param \Magento\Framework\App\Config\ScopeConfigInterface $scopeConfig
     * @param \Magento\Store\Model\StoreManagerInterface         $storeManager
     */
    public function __construct(
        \Magento\Framework\App\Action\Context $context,
        \Magento\Framework\Mail\Template\TransportBuilder $transportBuilder,
        \Magento\Framework\App\Config\ScopeConfigInterface $scopeConfig,
        \Magento\Store\Model\StoreManagerInterface $storeManager
    ) {

        $this->transportBuilder = $transportBuilder;
        $this->scopeConfig = $scopeConfig;
        $this->storeManager = $storeManager;
    }

    public function sendEmail($templateParams)
    {
        $transport = $this->transportBuilder
            ->setTemplateIdentifier('hawksearch_proxy_email')
            ->setTemplateOptions(
                [
                    'area' => \Magento\Framework\App\Area::AREA_ADMINHTML,
                    'store' => \Magento\Store\Model\Store::DEFAULT_STORE_ID,
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
                    explode(',', $this->scopeConfig->getValue('hawksearch_proxy/sync/email'))
                )
            )
            ->getTransport();
        $transport->sendMessage();
    }
}

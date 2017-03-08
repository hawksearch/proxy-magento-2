<?php

namespace HawkSearch\Proxy\Model;

class ProxyEmail
{

    /**
     * @var \Magento\Framework\Mail\Template\TransportBuilder
     */
    protected $_transportBuilder;

    /**
     * @var \Magento\Framework\Translate\Inline\StateInterface
     */
    protected $inlineTranslation;

    /**
     * @var \Magento\Framework\App\Config\ScopeConfigInterface
     */
    protected $scopeConfig;

    /**
     * @var \Magento\Store\Model\StoreManagerInterface
     */
    protected $storeManager;

    /**
     * @var \Magento\Framework\Escaper
     */
    protected $_escaper;

    /**
     * @param \Magento\Framework\App\Action\Context $context
     * @param \Magento\Framework\Mail\Template\TransportBuilder $transportBuilder
     * @param \Magento\Framework\Translate\Inline\StateInterface $inlineTranslation
     * @param \Magento\Framework\App\Config\ScopeConfigInterface $scopeConfig
     * @param \Magento\Store\Model\StoreManagerInterface $storeManager
     */
    public function __construct(
        \Magento\Framework\App\Action\Context $context,
        \Magento\Framework\Mail\Template\TransportBuilder $transportBuilder,
        \Magento\Framework\Translate\Inline\StateInterface $inlineTranslation,
        \Magento\Framework\App\Config\ScopeConfigInterface $scopeConfig,
        \Magento\Store\Model\StoreManagerInterface $storeManager,
        \Magento\Framework\Escaper $escaper
    )
    {

        $this->_transportBuilder = $transportBuilder;
        $this->inlineTranslation = $inlineTranslation;
        $this->scopeConfig = $scopeConfig;
        $this->storeManager = $storeManager;
        $this->_escaper = $escaper;
    }

    public function sendEmail($receiver, $templateParams)
    {
        $this->inlineTranslation->suspend();
        $sender = ['name' => $this->_getSenderName(), 'email' => $this->_getSenderEmail()];
        $transport = $this->_transportBuilder
            ->setTemplateIdentifier('hawksearch_proxy_email')
            ->setTemplateOptions(
                [
                    'area' => \Magento\Framework\App\Area::AREA_ADMINHTML,
                    'store' => \Magento\Store\Model\Store::DEFAULT_STORE_ID,
                ]
            )
            ->setTemplateVars($templateParams)
            ->setFrom($sender)
            ->addTo($receiver)
            ->getTransport();
        $transport->sendMessage();

        $this->inlineTranslation->resume();
    }

    protected function _getSenderName()
    {
        return $this->scopeConfig->getValue('trans_email/ident_general/name') ?: 'Russo Administrator';
    }

    protected function _getSenderEmail()
    {
        return $this->scopeConfig->getValue('trans_email/ident_general/email') ?: 'russo@russopower.com';
    }
}
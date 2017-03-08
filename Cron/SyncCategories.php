<?php

namespace HawkSearch\Proxy\Cron;

class SyncCategories
{
    /**
     * @var \HawkSearch\Proxy\Helper\Data
     */
    protected $_helper;
    /** @var \HawkSearch\Proxy\Model\ProxyEmail $email */
    private $email;

    public function __construct(
        \HawkSearch\Proxy\Helper\Data $helper,
        \HawkSearch\Proxy\Model\ProxyEmail $email
    )
    {
        $this->_helper = $helper;
        $this->email = $email;
    }

    public function execute()
    {
        if ($this->_helper->isCronEnabled()) {
            if($this->_helper->isSyncLocked()) {
                try {
                    if ($receiver = $this->_helper->getEmailReceiver()) {
                        $this->email->sendEmail($receiver, [
                            'status_text' => 'with following message:',
                            'extra_html' => "<p><strong>One or more HawkSearch Proxy feeds are being generated. Generation temporarily locked.</strong></p>"
                        ]);
                        $this->_helper->log('email notification has been sent');
                    }
                } catch (\Exception $e) {
                    $this->_helper->log('-- Error: ' . $e->getMessage() . ' - File: ' . $e->getFile() . ' on line ' . $e->getLine());
                    $this->_helper->logException($e);
                    $this->_helper->log('email notification has not been sent successfully');
                }

            } else {
                $this->_helper->synchronizeHawkLandingPages();
            }
        }
    }
}
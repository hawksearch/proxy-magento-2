<?php
/**
 * Copyright (c) 2017 Hawksearch (www.hawksearch.com) - All Rights Reserved
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */
$opts = getopt('r:t:f:');

require 'app/bootstrap.php';

$bootstrap = \Magento\Framework\App\Bootstrap::create(BP, $_SERVER);
$obj = $bootstrap->getObjectManager();

$state = $obj->get('Magento\Framework\App\State');
$state->setAreaCode('frontend');

$helper = $obj->get('HawkSearch\Proxy\Helper\Data');

if (isset($opts['f'])) {
    $helper->setOverwriteFlag($opts['f']);
}

if ($helper->isSyncLocked()) {
    $helper->log("-- Block: One or more HawkSearch Proxy feeds are being generated. Generation temporarily locked.");
    try {
        if ($reciever = $helper->getEmailReceiver()) {
            /**
 * @var \HawkSearch\Proxy\Model\ProxyEmail $mail_helper
*/
            $mail_helper = $obj->create('HawkSearch\Proxy\Model\ProxyEmail');
            $mail_helper->sendEmail(
                $reciever, [
                'status_text' => 'with following message:',
                'extra_html' => "<p><strong>One or more HawkSearch Proxy feeds are being generated. Generation temporarily locked.</strong></p>"
                ]
            );
            $helper->log('email notification has been sent');
        }
    } catch (\Exception $e) {
        $helper->log('-- Error: ' . $e->getMessage() . ' - File: ' . $e->getFile() . ' on line ' . $e->getLine());
        $helper->log('email notification has not been sent successfully');
    }
} else {
    // create lock file
    if ($helper->createSyncLocks()) {
        // start progress
        $helper->synchronizeHawkLandingPages();
        $helper->log('done synchronizing landing pages, removing locks');
        // send email for notification
        if ($helper->sendStatusEmail() === false) {
            $helper->log('email notification has not been sent successfully');
        } else {
            if ($helper->getEmailReceiver()) {
                $helper->log('email notification has been sent');
            }
        }
        // remove lock file
        $helper->removeSyncLocks();
        $helper->log('-- Success.');
    }
}
unlink($opts['t']);
exit(0);

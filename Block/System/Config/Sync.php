<?php
/**
 * Copyright (c) 2013 Hawksearch (www.hawksearch.com) - All Rights Reserved
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */
namespace HawkSearch\Proxy\Block\System\Config;

use DateTime;
use Exception;
use HawkSearch\Proxy\Helper\Data;
use HawkSearch\Proxy\Model\Task\SyncCategories\TaskScheduler;
use Magento\Backend\Block\Template\Context;
use Magento\Config\Block\System\Config\Form\Field;
use Magento\Cron\Model\Schedule;
use Magento\Framework\Data\Form\Element\AbstractElement;
use Magento\Framework\Stdlib\DateTime\TimezoneInterface;

class Sync extends Field
{
    private $helper;

    /** @var TaskScheduler */
    private $taskScheduler;

    /** @var Schedule */
    private $nextScheduled = null;

    /** @var TimezoneInterface */
    private $timezone;

    /**
     * @param Context $context
     * @param Data $helper
     * @param TaskScheduler $taskScheduler
     * @param TimezoneInterface $timezone
     * @param array $data
     */
    public function __construct(
        Context $context,
        Data $helper,
        TaskScheduler $taskScheduler,
        TimezoneInterface $timezone,
        array $data = []
    ) {
        $this->helper = $helper;
        parent::__construct($context, $data);
        $this->taskScheduler = $taskScheduler;
        $this->timezone      = $timezone;
    }

    protected function _prepareLayout()
    {
        parent::_prepareLayout();
        if (!$this->getTemplate()) {
            $this->setTemplate('HawkSearch_Proxy::system/config/button/sync.phtml');
        }
        return $this;
    }
    /**
     * Render button
     *
     * @param AbstractElement $element
     * @return string
     */
    public function render(AbstractElement $element)
    {
        // Remove scope label
        $element->unsScope()->unsCanUseWebsiteValue()->unsCanUseDefaultValue();
        return parent::render($element);
    }
    /**
     * Get the button and scripts contents
     *
     * @param AbstractElement $element
     * @return string
     */
    protected function _getElementHtml(AbstractElement $element)
    {
        $config = $element->getFieldConfig();
        $this->addData(
            [
                'button_label' =>$config['button_label'],
                'intern_url' => $this->getUrl($config['button_url']),
                'html_id' => $element->getHtmlId(),
            ]
        );
        return $this->_toHtml();
    }
    public function isSyncLocked()
    {
        return $this->helper->isSyncLocked();
    }

    /**
     * Loads and stores the next task cron schedule.
     */
    private function loadNextScheduled() : void
    {
        $this->nextScheduled = $this->taskScheduler->getNextScheduled();
    }

    /**
     * @return int|null
     */
    public function getNextScheduledId() : ?int
    {
        if ($this->nextScheduled === null) {
            $this->loadNextScheduled();
        }

        return $this->nextScheduled
            ? (int)$this->nextScheduled->getId()
            : null;
    }

    /**
     * @return string|null
     */
    public function getNextScheduledTimestamp() : ?string
    {
        if ($this->nextScheduled === null) {
            $this->loadNextScheduled();
        }

        if ($this->nextScheduled === null) {
            return null;
        }

        try {
            return $this->timezone
                ->date(new DateTime($this->nextScheduled->getScheduledAt()))
                ->format(DateTime::RFC850);
        } catch (Exception $exception) {
            return null;
        }
    }
}
